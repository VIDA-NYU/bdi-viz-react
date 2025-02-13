import { useState, useCallback, useEffect, use } from 'react';

type DashboardFilterState = {
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
    updateSourceColumn: (column: string) => void;
    updateCandidateType: (type: string) => void;
    updateSimilarSources: (num: number) => void;
    updateCandidateThreshold: (threshold: number) => void;
}

export type { DashboardFilterState };

type DashboardFilterProps = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: Matcher[];
}

export const {
    useDashboardFilters
} = {
    useDashboardFilters: ({
        candidates,
        sourceClusters,
        matchers,
    }: DashboardFilterProps): DashboardFilterState => {
        const [sourceColumn, setSourceColumn] = useState<string>(candidates[0]?.sourceColumn ?? '');
        const [candidateType, setCandidateType] = useState<string>('all');
        const [similarSources, setSimilarSources] = useState<number>(2);
        const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);

        useEffect(() => {
            setSourceColumn(candidates[0]?.sourceColumn ?? '');
        }, [sourceClusters]);

        const updateSourceColumn = useCallback((column: string) => {
            setSourceColumn(column);
        }, []);

        const updateCandidateType = useCallback((type: string) => {
            setCandidateType(type);
        }, []);

        const updateSimilarSources = useCallback((num: number) => {
            setSimilarSources(num);
        }, []);

        const updateCandidateThreshold = useCallback((threshold: number) => {
            setCandidateThreshold(threshold);
        }, []);

        return {
            sourceColumn,
            candidateType,
            similarSources,
            candidateThreshold,
            updateSourceColumn,
            updateCandidateType,
            updateSimilarSources,
            updateCandidateThreshold,
        };
    }
};