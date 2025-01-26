import React, { useState, useCallback, useEffect } from 'react';
import type { Candidate } from '../types';
import { toastify } from "@/app/lib/toastify/toastify-helper";
import { getCachedResults } from '@/app/lib/heatmap/heatmap-helper';
import { getMockData } from '../components/utils/mock';
import { useDashboardFilters } from './useDashboardFilters';


type DashboardCandidateState = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: string[];
    selectedCandidate: Candidate | undefined;
    selectedMatchers: string[];
    handleFileUpload: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
    handleChatUpdate: (candidates: Candidate[]) => void;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
    setSelectedMatchers: (matcher: string) => void;
}

export type { DashboardCandidateState };

export const {
    useDashboardCandidates
} = {
    useDashboardCandidates: (): DashboardCandidateState => {

        const [candidates, setCandidates] = useState<Candidate[]>(getMockData());
        const [sourceClusters, setSourceClusters] = useState<SourceCluster[]>([]);
        const [matchers, setMatchers] = useState<string[]>([]);
        const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);
        const [selectedMatchers, setSelectedMatchers] = useState<string[]>(matchers);

        const { updateSourceColumn } = useDashboardFilters();

        const handleFileUpload = useCallback((candidates: Candidate[], sourceCluster?: SourceCluster[]) => {
            setCandidates(candidates.sort((a, b) => b.score - a.score));
            if (sourceCluster) {
                setSourceClusters(sourceCluster);
            }

            const newMatchers = [...new Set(candidates.map(c => c.matcher).filter((matcher): matcher is string => matcher !== undefined))];
            setMatchers(newMatchers);
            setSelectedMatchers(newMatchers);

            if (selectedCandidate) {
                updateSourceColumn(selectedCandidate.sourceColumn);
            } else {
                updateSourceColumn(candidates[0].sourceColumn);
            }
            // setSelectedCandidate(undefined);
        }, [selectedCandidate, updateSourceColumn]);

        const handleChatUpdate = useCallback((newCandidates: Candidate[]) => {
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);
        }, []);

        const handleSelectedCandidate = useCallback((candidate: Candidate | undefined) => {
            setSelectedCandidate(candidate);
        }, []);

        const handleSelectedMatchers = useCallback((matcher: string) => {
            if (selectedMatchers.includes(matcher)) {
                setSelectedMatchers(selectedMatchers.filter(m => m !== matcher));
            } else {
                setSelectedMatchers([...selectedMatchers, matcher]);
            }
        }, [selectedMatchers]);

        // useEffect(() => {

        // })
        useEffect(() => {
            getCachedResults({
                callback: handleFileUpload 
            });
        }, [handleFileUpload]);

        return {
            candidates,
            sourceClusters,
            matchers,
            selectedCandidate,
            selectedMatchers,
            handleFileUpload,
            handleChatUpdate,
            setSelectedCandidate: handleSelectedCandidate,
            setSelectedMatchers: handleSelectedMatchers
        };
    }
};