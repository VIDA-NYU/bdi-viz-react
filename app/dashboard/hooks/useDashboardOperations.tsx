import { useState, useCallback } from 'react';
import type { Candidate, UserOperation } from '../types';
import { toastify } from "@/app/lib/toastify/toastify-helper";
import { userOperationRequest } from "@/app/lib/langchain/agent-helper";

type DashboardOperationProps = {
    candidates: Candidate[];
    selectedCandidate: Candidate | undefined;
    onCandidateUpdate: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
    onCandidateSelect: (candidate: Candidate | undefined) => void;
    onDiagnosis?: (diagnosis: AgentDiagnosis | undefined) => void;
}

type DashboardOperationState = {
    userOperations: UserOperation[];
    acceptMatch: () => Promise<void>;
    rejectMatch: () => void;
    discardColumn: () => void;
    undo: () => void;
    explain: () => void;
}

export type { DashboardOperationState };

export const {
    useDashboardOperations
} = {
    useDashboardOperations: ({
        candidates,
        selectedCandidate,
        onCandidateUpdate,
        onCandidateSelect,
        onDiagnosis
    }: DashboardOperationProps): DashboardOperationState => {
        const [userOperations, setUserOperations] = useState<UserOperation[]>([]);

        const acceptMatch = useCallback(async () => {
            if (!selectedCandidate) return;

            const references: Candidate[] = [];
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
                if (candidate.targetColumn === selectedCandidate.targetColumn) {
                    return true;
                } else {
                    references.push(candidate);
                    return false;
                }
            });

            onCandidateUpdate(newCandidates);
            onCandidateSelect(undefined);

            const userOperation: UserOperation = {
                operation: 'accept',
                candidate: selectedCandidate,
                references
            };

            setUserOperations(prev => [...prev, userOperation]);
            toastify("success", <p>Match accepted: <strong>{selectedCandidate.sourceColumn}</strong> - <strong>{selectedCandidate.targetColumn}</strong></p>);
            
            if (onDiagnosis) {
                const diagnosis = await userOperationRequest(userOperation);
                if (diagnosis) {
                    onDiagnosis(diagnosis);
                }
            }
        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect, onDiagnosis]);

        const rejectMatch = useCallback(() => {
            if (!selectedCandidate) return;

            const references: Candidate[] = [];
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
                references.push(candidate);
                if (candidate.targetColumn !== selectedCandidate.targetColumn) {
                    return true;
                } else {
                    return false;
                }
            });

            onCandidateUpdate(newCandidates);
            onCandidateSelect(undefined);

            const userOperation: UserOperation = {
                operation: 'reject',
                candidate: selectedCandidate,
                references
            };

            setUserOperations(prev => [...prev, userOperation]);
            toastify("success", <p>Match rejected: <strong>{selectedCandidate.sourceColumn}</strong> - <strong>{selectedCandidate.targetColumn}</strong></p>);
        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect]);

        const discardColumn = useCallback(() => {
            if (!selectedCandidate) return;

            const references: Candidate[] = [];
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
                references.push(candidate);
                return false;
            });

            onCandidateUpdate(newCandidates);
            onCandidateSelect(undefined);

            const userOperation: UserOperation = {
                operation: 'discard',
                candidate: selectedCandidate,
                references
            };

            setUserOperations(prev => [...prev, userOperation]);
            toastify("success", <p>Column discarded: <strong>{selectedCandidate.sourceColumn}</strong></p>);
        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect]);

        const undo = useCallback(() => {
            const lastOperation = userOperations[userOperations.length - 1];
            if (!lastOperation) return;

            let newCandidates: Candidate[];
            switch (lastOperation.operation) {
                case 'accept':
                case 'discard':
                    newCandidates = [...candidates, ...lastOperation.references];
                    newCandidates = newCandidates.sort((a, b) => b.score - a.score);
                    break;
                case 'reject':
                    newCandidates = [...candidates, lastOperation.candidate];
                    newCandidates = newCandidates.sort((a, b) => b.score - a.score);
                    break;
                default:
                    return;
            }

            // newCandidates = newCandidates.sort((a, b) => b.score - a.score);
            onCandidateUpdate(newCandidates);
            onCandidateSelect(lastOperation.candidate);
            setUserOperations(prev => prev.slice(0, -1));
        }, [candidates, userOperations, onCandidateUpdate, onCandidateSelect]);

        const explain = useCallback(async () => {
            if (!selectedCandidate) return;


        }, [candidates, userOperations, onCandidateUpdate, onCandidateSelect]);

        return {
            userOperations,
            acceptMatch,
            rejectMatch,
            discardColumn,
            undo,
            explain,
        };
    }
};