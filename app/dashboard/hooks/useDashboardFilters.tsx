import { useState, useCallback, useEffect, use } from 'react';

type DashboardFilterState = {
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
    selectedMatcher: Matcher;
    updateSourceColumn: (column: string) => void;
    updateCandidateType: (type: string) => void;
    updateSimilarSources: (num: number) => void;
    updateCandidateThreshold: (threshold: number) => void;
    updateSelectedMatcher: (matcher: Matcher) => void;
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
        const [selectedMatcher, setSelectedMatcher] = useState<Matcher>(matchers[0]);

        useEffect(() => {
            setSourceColumn(candidates[0]?.sourceColumn ?? '');
        }, [candidates]);

        useEffect(() => {
            setSelectedMatcher(matchers[0]);
        }, [matchers]);

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

        const updateSelectedMatcher = useCallback((matcher: Matcher) => {
            setSelectedMatcher(matcher);
        }, []);

        return {
            sourceColumn,
            candidateType,
            similarSources,
            candidateThreshold,
            selectedMatcher,
            updateSourceColumn,
            updateCandidateType,
            updateSimilarSources,
            updateCandidateThreshold,
            updateSelectedMatcher,
        };
    }
};