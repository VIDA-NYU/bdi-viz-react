import { useState, useEffect } from 'react';
import { useWhatChanged } from '@simbathesailor/use-what-changed';

type DashboardInterfacesState = {
    filteredCandidates: Candidate[];
    filteredSourceCluster: string[];
    filteredCandidateCluster: string[];
}

type DashboardInterfacesProps = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: Matcher[];
    candidateClusters: CandidateCluster[];
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
    useDashboardInterfaces: ({ candidates, sourceClusters, matchers, candidateClusters, filters }: DashboardInterfacesProps): DashboardInterfacesState => {
        const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(candidates);
        const [filteredSourceCluster, setFilteredSourceCluster] = useState<string[]>(sourceClusters.map(sourceCluster => sourceCluster.sourceColumn));
        const [filteredCandidateCluster, setFilteredCandidateCluster] = useState<string[]>([]);

        // useWhatChanged([filters.sourceColumn, filters.selectedMatchers, filters.similarSources, filters.candidateThreshold, filters.candidateType]);
        useEffect(() => {
            let filteredData = [...candidates];
            let filteredSourceCluster: string[] | undefined;

            // filter by matchers
            if (filters.selectedMatcher) {
                const selectedMatcherName = filters.selectedMatcher.name;
                filteredData = filteredData.filter((d) => d.matcher && d.matcher === selectedMatcherName);
            }

            if (filters?.sourceColumn) {
                const sourceCluster = sourceClusters?.find(sc =>
                    sc.sourceColumn === filters.sourceColumn
                );
                filteredSourceCluster = sourceCluster?.cluster;
                if (filteredSourceCluster !== undefined) {
                    if (filters.similarSources) {
                        filteredSourceCluster = filteredSourceCluster.slice(0, filters.similarSources);
                    }

                    filteredData = filteredSourceCluster
                        ? filteredData.filter(d => filteredSourceCluster?.includes(d.sourceColumn))
                            .sort((a, b) => (filteredSourceCluster?.indexOf(a.sourceColumn) ?? 0) - (filteredSourceCluster?.indexOf(b.sourceColumn) ?? 0))
                        : filteredData.filter(d => d.sourceColumn === filters.sourceColumn);
                }
            }

            if (filters?.candidateThreshold) {
                filteredData = filteredData.filter((d) => d.score >= filters.candidateThreshold);
            }

            setFilteredCandidates(filteredData);
            setFilteredSourceCluster(filteredSourceCluster ?? []);
        }, [candidates, filters.sourceColumn, filters.selectedMatcher, filters.similarSources, filters.candidateThreshold, filters.candidateType]);

        return {
            filteredCandidates,
            filteredSourceCluster,
            filteredCandidateCluster,
        };
    }
}