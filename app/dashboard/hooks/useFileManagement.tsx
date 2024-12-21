import { useState, useCallback, useEffect } from 'react';
import { toastify } from "@/app/lib/toastify/toastify-helper";
import { getCachedResults } from "@/app/lib/heatmap/heatmap-helper";

type DashboardCandidateState = {
    candidates: Candidate[];
    sourceClusters: SourceCluster[];
    selectedCandidate: Candidate | undefined;
    handleFileUpload: (candidates: Candidate[], sourceClusters: SourceCluster[]) => void;
    handleChatUpdate: (candidates: Candidate[]) => void;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
}

export type { DashboardCandidateState };

export const {
    useDashboardCandidates
} = {
    useDashboardCandidates: (): DashboardCandidateState => {
        const [candidates, setCandidates] = useState<Candidate[]>([]);
        const [sourceClusters, setSourceClusters] = useState<SourceCluster[]>([]);
        const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);

        const handleFileUpload = useCallback((newCandidates: Candidate[], newSourceClusters: SourceCluster[]) => {
            setCandidates(newCandidates);
            setSourceClusters(newSourceClusters);
            setSelectedCandidate(undefined);
        }, []);

        const handleChatUpdate = useCallback((newCandidates: Candidate[]) => {
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);
        }, []);

        const handleSelectedCandidate = useCallback((candidate: Candidate | undefined) => {
            toastify("default", <p><strong>Source: </strong>{candidate?.sourceColumn}, <strong>Target: </strong>{candidate?.targetColumn}</p>, { autoClose: 200 });
            setSelectedCandidate(candidate);
        }, []);

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