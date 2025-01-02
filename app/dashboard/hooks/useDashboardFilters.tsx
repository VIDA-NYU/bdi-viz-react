import { useState, useCallback } from 'react';

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

export const {
    useDashboardFilters
} = {
    useDashboardFilters: (initialSourceColumn: string = ''): DashboardFilterState => {
        const [sourceColumn, setSourceColumn] = useState<string>(initialSourceColumn);
        const [candidateType, setCandidateType] = useState<string>('all');
        const [similarSources, setSimilarSources] = useState<number>(2);
        const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);

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
            updateCandidateThreshold
        };
    }
};