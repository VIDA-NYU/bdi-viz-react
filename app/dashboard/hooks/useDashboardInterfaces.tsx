import { useState, useEffect, useMemo } from 'react';
import * as d3 from "d3";

type DashboardInterfacesState = {
    filteredCandidates: Candidate[];
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
    };
}

export type { DashboardInterfacesState };

export const {
    useDashboardInterfaces
} = {
    useDashboardInterfaces: ({ candidates, sourceClusters, matchers, filters }: DashboardInterfacesProps): DashboardInterfacesState => {
        const [filteredCandidateCluster, setFilteredCandidateCluster] = useState<string[]>([]);

        // useWhatChanged([filters.sourceColumn, filters.selectedMatchers, filters.similarSources, filters.candidateThreshold, filters.candidateType]);

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

        const filteredCandidates = useMemo(() => {
            let filteredData = [...candidates];
            if (filteredSourceCluster && filteredSourceCluster.length > 0) {
                filteredData = filteredData.filter((d) => filteredSourceCluster.includes(d.sourceColumn));
            }

            return filteredData;
        }, [candidates, filteredSourceCluster, filters.candidateType]);

        const weightedAggregatedCandidates = useMemo(() => {
            let aggregatedCandidates = Array.from(d3.group(filteredCandidates, d => d.sourceColumn + d.targetColumn), ([_, items]) => {
                return {
                    sourceColumn: items[0].sourceColumn,
                    targetColumn: items[0].targetColumn,
                    matchers: items.map(d => d.matcher).filter((m): m is string => m !== undefined),
                    score: d3.sum(items, d => d.score * (matchers.find(m => m.name === d.matcher)?.weight ?? 1)),
                    status: items[0].status ?? '',
                };
            }).flat().sort((a, b) => b.score - a.score).map((d, idx) => ({ id: idx + 1, ...d }));

            if (filters?.candidateThreshold) {
                aggregatedCandidates = aggregatedCandidates.filter((d) => d.score >= filters.candidateThreshold);
            }

            return aggregatedCandidates;
        }, [filteredCandidates, matchers, filters.candidateThreshold]);

        const filteredSourceColumns = useMemo(() => {
        const groupedSourceColumns = Array.from(d3.group(candidates, d => d.sourceColumn), ([name, items]: [string, Candidate[]]) => {
            return {
                name,
                status: items.some(item => item.status === 'accepted') ? 'complete' : (items.every(item => item.status === 'discarded') ? 'ignored' : 'incomplete')
            } as SourceColumn;
        });

            return groupedSourceColumns;
        }, [candidates]);

        return {
            filteredCandidates,
            filteredSourceCluster,
            filteredCandidateCluster,
            weightedAggregatedCandidates,
            filteredSourceColumns,
        };
    }
}