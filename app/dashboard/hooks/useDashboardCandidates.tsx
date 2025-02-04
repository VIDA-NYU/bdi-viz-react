import React, { useState, useCallback, useEffect } from 'react';
import type { Candidate } from '../types';
import { getCachedResults, getValueBins, getValueMatches } from '@/app/lib/heatmap/heatmap-helper';
import { getMockData } from '../components/utils/mock';


type DashboardCandidateState = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: Matcher[];
    selectedCandidate: Candidate | undefined;
    sourceUniqueValues: SourceUniqueValues[];
    targetUniqueValues: TargetUniqueValues[];
    valueMatches: ValueMatch[];
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
        const [matchers, setMatchers] = useState<Matcher[]>([]);
        const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);
        const [sourceUniqueValues, setSourceUniqueValues] = useState<SourceUniqueValues[]>([]);
        const [targetUniqueValues, setTargetUniqueValues] = useState<TargetUniqueValues[]>([]);
        const [valueMatches, setValueMatches] = useState<ValueMatch[]>([]);

        const handleFileUpload = useCallback((candidates: Candidate[], sourceCluster?: SourceCluster[], matchers?: Matcher[]) => {
            setCandidates(candidates.sort((a, b) => b.score - a.score));
            if (sourceCluster) {
                setSourceClusters(sourceCluster);
            }

            if (matchers) {
                setMatchers(matchers);
            }
            // setSelectedCandidate(undefined);
        }, [selectedCandidate]);

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
        }, []);

        return {
            candidates,
            sourceClusters,
            matchers,
            selectedCandidate,
            sourceUniqueValues,
            targetUniqueValues,
            valueMatches,
            handleFileUpload,
            handleChatUpdate,
            setSelectedCandidate: handleSelectedCandidate
        };
    }
};