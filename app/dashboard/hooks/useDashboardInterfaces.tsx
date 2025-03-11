import { useState, useEffect, useMemo } from 'react';
import * as d3 from "d3";

type DashboardInterfacesState = {
    filteredSourceCluster: string[];
    filteredCandidateCluster: string[];
    weightedAggregatedCandidates: AggregatedCandidate[];
    filteredSourceColumns: SourceColumn[];
}

type DashboardInterfacesProps = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: Matcher[];
    filters: {
        selectedCandidate?: Candidate;
        sourceColumn: string;
        candidateType: string;
        similarSources: number;
        candidateThreshold: number;
        selectedMatcher?: Matcher;
        status: string[];
    };
}

export type { DashboardInterfacesState };

export const {
    useDashboardInterfaces
} = {
    useDashboardInterfaces: ({ candidates, sourceClusters, matchers, filters }: DashboardInterfacesProps): DashboardInterfacesState => {
        const [filteredCandidateCluster, setFilteredCandidateCluster] = useState<string[]>([]);

        // useWhatChanged([filters.sourceColumn, filters.selectedMatchers, filters.similarSources, filters.candidateThreshold, filters.candidateType]);

        const weightedCandidates = useMemo(() => {
            let aggregatedCandidates = Array.from(d3.group(candidates, d => d.sourceColumn + d.targetColumn), ([_, items]) => {
                return {
                    sourceColumn: items[0].sourceColumn,
                    targetColumn: items[0].targetColumn,
                    matchers: items.map(d => d.matcher).filter((m): m is string => m !== undefined),
                    score: d3.sum(items, d => d.score * (matchers.find(m => m.name === d.matcher)?.weight ?? 1)),
                    status: items.some(item => item.status === 'accepted') ? 'accepted' : items.some(item => item.status === 'rejected') ? 'rejected' : (items.every(item => item.status === 'discarded') ? 'discarded' : 'idle'),
                };
            }).flat().sort((a, b) => b.score - a.score);

            return aggregatedCandidates;
        }, [candidates, matchers]);


        const filteredSourceCluster = useMemo(() => {
            if (filters?.sourceColumn) {
                if (filters.sourceColumn === 'all') {
                    return sourceClusters?.map(sc => sc.sourceColumn) ?? [];
                }
                const sourceCluster = sourceClusters?.find(sc =>
                    sc.sourceColumn === filters.sourceColumn
                );
                let filteredSourceCluster = sourceCluster?.cluster;
                if (filteredSourceCluster) {
                    if (filters.similarSources) {
                        filteredSourceCluster = filteredSourceCluster.slice(0, filters.similarSources);
                    }
                    return filteredSourceCluster;
                }
            }
            return [];
        }, [sourceClusters, filters.sourceColumn, filters.similarSources]);

        const weightedAggregatedCandidates = useMemo(() => {

            let filteredData = [...weightedCandidates];
            if (filteredSourceCluster && filteredSourceCluster.length > 0) {
                filteredData = filteredData.filter((d) => filteredSourceCluster.includes(d.sourceColumn));
            }

            if (filters?.candidateThreshold) {
                filteredData = filteredData.filter((d) => d.score >= filters.candidateThreshold);
            }

            if (filters.status.length > 0) {
                filteredData = filteredData.filter((d) => filters.status.includes(d.status));
            }

            return filteredData;
        }, [weightedCandidates, filteredSourceCluster, filters.candidateThreshold, filters.status]);

        const filteredSourceColumns = useMemo(() => {
        const groupedSourceColumns = Array.from(d3.group(weightedCandidates, d => d.sourceColumn), ([name, items]: [string, Candidate[]]) => {
            return {
                name,
                status: items.some(item => item.status === 'accepted') ? 'complete' : (items.every(item => item.status === 'discarded') ? 'ignored' : 'incomplete'),
                maxScore: Math.floor(((d3.max(items, d => d.score) ?? 0) / 0.1)) * 0.1,
            } as SourceColumn;
        });

            return groupedSourceColumns;
        }, [weightedCandidates]);

        return {
            filteredSourceCluster,
            filteredCandidateCluster,
            weightedAggregatedCandidates,
            filteredSourceColumns,
        };
    }
}