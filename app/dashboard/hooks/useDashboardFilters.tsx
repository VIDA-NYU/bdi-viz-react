import { useState, useCallback, useEffect, use } from 'react';

type DashboardFilterState = {
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
    searchResults: Candidate[];
    status: string[];
    updateSourceColumn: (column: string) => void;
    updateCandidateType: (type: string) => void;
    updateSimilarSources: (num: number) => void;
    updateCandidateThreshold: (threshold: number) => void;
    updateSearchResults: (results: Candidate[]) => void;
    updateStatus: (status: string[]) => void;
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
        const [sourceColumn, setSourceColumn] = useState<string>('all');
        const [candidateType, setCandidateType] = useState<string>('all');
        const [similarSources, setSimilarSources] = useState<number>(2);
        const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);
        const [searchResults, setSearchResults] = useState<Candidate[]>([]);
        const [status, setStatus] = useState<string[]>(['accepted']); // 'accepted', 'rejected', 'discarded', 'idle'

        // useEffect(() => {
        //     setSourceColumn(candidates[0]?.sourceColumn ?? '');
        // }, [sourceClusters]);

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

        const updateSearchResults = useCallback((results: Candidate[]) => {
            setSearchResults(results);
        }, []);

        const updateStatus = useCallback((status: string[]) => {
            setStatus(status);
        }, []);

        return {
            sourceColumn,
            candidateType,
            similarSources,
            candidateThreshold,
            searchResults,
            status,
            updateSourceColumn,
            updateCandidateType,
            updateSimilarSources,
            updateCandidateThreshold,
            updateSearchResults,
            updateStatus,
        };
    }
};