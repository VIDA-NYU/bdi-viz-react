import React, { useState, useCallback, useEffect } from 'react';
import type { Candidate } from '../types';
import { toastify } from "@/app/lib/toastify/toastify-helper";
import { getCachedResults } from '@/app/lib/heatmap/heatmap-helper';
import { getMockData } from '../components/utils/mock';
import { useDashboardFilters } from './useDashboardFilters';


type DashboardCandidateState = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    selectedCandidate: Candidate | undefined;
    handleFileUpload: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
    handleChatUpdate: (candidates: Candidate[]) => void;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
}

export type { DashboardCandidateState };

export const {
    useDashboardCandidates
} = {
    useDashboardCandidates: (): DashboardCandidateState => {

        const [candidates, setCandidates] = useState<Candidate[]>(getMockData());
        const [sourceClusters, setSourceClusters] = useState<SourceCluster[]>([]);
        const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);

        const { updateSourceColumn } = useDashboardFilters();

        const handleFileUpload = useCallback((candidates: Candidate[], sourceCluster?: SourceCluster[]) => {
            setCandidates(candidates.sort((a, b) => b.score - a.score));
            if (sourceCluster) {
                setSourceClusters(sourceCluster);
            }

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
            selectedCandidate,
            handleFileUpload,
            handleChatUpdate,
            setSelectedCandidate: handleSelectedCandidate
        };
    }
};