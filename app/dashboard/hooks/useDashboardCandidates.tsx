import React, { useState, useCallback, useEffect } from 'react';
import type { Candidate } from '../types';
import { getCachedResults, getValueBins, getValueMatches, getUserOperationHistory } from '@/app/lib/heatmap/heatmap-helper';
import { getMockData } from '../components/utils/mock';


type DashboardCandidateState = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: Matcher[];
    selectedCandidate: Candidate | undefined;
    sourceUniqueValues: SourceUniqueValues[];
    targetUniqueValues: TargetUniqueValues[];
    valueMatches: ValueMatch[];
    userOperations: UserOperation[];
    handleFileUpload: (newCandidates: Candidate[], newSourceClusters?: SourceCluster[], newMatchers?: Matcher[]) => void;
    handleChatUpdate: (candidates: Candidate[]) => void;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
    setMatchers: (matchers: Matcher[]) => void;
    handleUserOperationsUpdate: (newUserOperations: UserOperation[]) => void;
}

export type { DashboardCandidateState };

export const {
    useDashboardCandidates
} = {
    useDashboardCandidates: (): DashboardCandidateState => {

        const [candidates, setCandidates] = useState<Candidate[]>(getMockData());
        const [sourceClusters, setSourceClusters] = useState<SourceCluster[]>([]);
        const [matchers, setMatchers] = useState<Matcher[]>([]);
        const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);
        const [sourceUniqueValues, setSourceUniqueValues] = useState<SourceUniqueValues[]>([]);
        const [targetUniqueValues, setTargetUniqueValues] = useState<TargetUniqueValues[]>([]);
        const [valueMatches, setValueMatches] = useState<ValueMatch[]>([]);
        const [userOperations, setUserOperations] = useState<UserOperation[]>([]);

        const handleFileUpload = useCallback((newCandidates: Candidate[], newSourceClusters?: SourceCluster[], newMatchers?: Matcher[]) => {
            setCandidates(newCandidates.sort((a, b) => b.score - a.score));
            if (newSourceClusters && JSON.stringify(newSourceClusters) !== JSON.stringify(sourceClusters)) {
                setSourceClusters(newSourceClusters);
            }

            if (newMatchers && JSON.stringify(newMatchers) !== JSON.stringify(matchers)) {
                setMatchers(newMatchers);
            }
        }, [sourceClusters]);

        const handleUniqueValues = useCallback((sourceUniqueValuesArray: SourceUniqueValues[], targetUniqueValuesArray: TargetUniqueValues[]) => {
            setSourceUniqueValues(sourceUniqueValuesArray);
            setTargetUniqueValues(targetUniqueValuesArray);
        }, []);

        const handleChatUpdate = useCallback((newCandidates: Candidate[]) => {
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);
        }, []);

        const handleSelectedCandidate = useCallback((candidate: Candidate | undefined) => {
            setSelectedCandidate(candidate);
        }, []);

        const handleValueMatches = useCallback((valueMatches: ValueMatch[]) => {
            setValueMatches(valueMatches);
        }, []);

        const handleUserOperationsUpdate = useCallback((newUserOperations: UserOperation[]) => {
            setUserOperations(newUserOperations);
        }, []);


        useEffect(() => {
            getCachedResults({
                callback: handleFileUpload 
            });
            getValueBins({
                callback: handleUniqueValues
            });
            getValueMatches({
                callback: handleValueMatches
            });
            getUserOperationHistory({
                callback: handleUserOperationsUpdate
            });
        }, []);

        return {
            candidates,
            sourceClusters,
            matchers,
            selectedCandidate,
            sourceUniqueValues,
            targetUniqueValues,
            valueMatches,
            userOperations,
            handleFileUpload,
            handleChatUpdate,
            setSelectedCandidate: handleSelectedCandidate,
            setMatchers,
            handleUserOperationsUpdate,
        };
    }
};