import { useState, useCallback } from 'react';
import type { Candidate } from '../types';
import { toastify } from "@/app/lib/toastify/toastify-helper";

type DashboardCandidateState = {
    candidates: Candidate[];
    selectedCandidate: Candidate | undefined;
    handleFileUpload: (candidates: Candidate[]) => void;
    handleChatUpdate: (candidates: Candidate[]) => void;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
}

export type { DashboardCandidateState };

export const {
    useDashboardCandidates
} = {
    useDashboardCandidates: (): DashboardCandidateState => {
        const [candidates, setCandidates] = useState<Candidate[]>([]);
        const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);

        const handleFileUpload = useCallback((newCandidates: Candidate[]) => {
            setCandidates(newCandidates);
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

        return {
            candidates,
            selectedCandidate,
            handleFileUpload,
            handleChatUpdate,
            setSelectedCandidate: handleSelectedCandidate
        };
    }
};