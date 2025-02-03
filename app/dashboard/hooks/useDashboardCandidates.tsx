import React, { useState, useCallback, useEffect } from 'react';
import type { Candidate } from '../types';
import { getCachedResults, getUniqueValues } from '@/app/lib/heatmap/heatmap-helper';
import { getMockData } from '../components/utils/mock';


type DashboardCandidateState = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    matchers: Matcher[];
    selectedCandidate: Candidate | undefined;
    selectedMatchers: Matcher[];
    handleFileUpload: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
    handleChatUpdate: (candidates: Candidate[]) => void;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
    setSelectedMatchers: (matcher: Matcher) => void;
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
        const [selectedMatchers, setSelectedMatchers] = useState<Matcher[]>(matchers);

        const handleFileUpload = useCallback((candidates: Candidate[], sourceCluster?: SourceCluster[], matchers?: Matcher[]) => {
            setCandidates(candidates.sort((a, b) => b.score - a.score));
            if (sourceCluster) {
                setSourceClusters(sourceCluster);
            }

            if (matchers) {
                setMatchers(matchers);
                setSelectedMatchers(matchers);
            }
            // setSelectedCandidate(undefined);
        }, [selectedCandidate]);

        const handleChatUpdate = useCallback((newCandidates: Candidate[]) => {
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);
        }, []);

        const handleSelectedCandidate = useCallback((candidate: Candidate | undefined) => {
            setSelectedCandidate(candidate);
        }, []);

        const handleSelectedMatchers = useCallback((matcher: Matcher) => {
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
            getUniqueValues({
                callback: (sourceUniqueValuesArray, targetUniqueValuesArray) => {
                    console.log('sourceUniqueValuesArray', sourceUniqueValuesArray);
                    console.log('targetUniqueValuesArray', targetUniqueValuesArray);
                }
            });
        }, []);

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