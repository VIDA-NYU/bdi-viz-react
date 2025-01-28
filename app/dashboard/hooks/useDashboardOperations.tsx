import { useState, useCallback, useContext } from 'react';
import type { Candidate, UserOperation } from '../types';
import { toastify } from "@/app/lib/toastify/toastify-helper";
import { applyUserOperations, undoUserOperations } from "@/app/lib/heatmap/heatmap-helper";
import { candidateExplanationRequest, agentSuggestionsRequest, agentActionRequest } from "@/app/lib/langchain/agent-helper";
import LoadingGlobalContext from "@/app/lib/loading/loading-context";
import { Explanation } from '../types';

type DashboardOperationProps = {
    candidates: Candidate[];
    selectedCandidate: Candidate | undefined;
    selectedExplanations?: Explanation[];
    onCandidateUpdate: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
    onCandidateSelect: (candidate: Candidate | undefined) => void;
    onExplanation?: (explanation: CandidateExplanation | undefined) => void;
    onSuggestions?: (suggestions: AgentSuggestions | undefined) => void;
    onApply?: (actionResponses: ActionResponse[] | undefined) => void;
}

type DashboardOperationState = {
    userOperations: UserOperation[];
    isExplaining: boolean;
    acceptMatch: () => Promise<void>;
    rejectMatch: () => void;
    discardColumn: () => void;
    undo: () => void;
    explain: (candidate?: Candidate) => void;
    apply: (reaction: UserReaction) => void;
}

export type { DashboardOperationState };

export const {
    useDashboardOperations
} = {
    useDashboardOperations: ({
        candidates,
        selectedCandidate,
        selectedExplanations,
        onCandidateUpdate,
        onCandidateSelect,
        onExplanation,
        onSuggestions,
        onApply,
    }: DashboardOperationProps): DashboardOperationState => {
        const [userOperations, setUserOperations] = useState<UserOperation[]>([]);
        const [isExplaining, setIsExplaining] = useState<boolean>(false);
        const { setIsLoadingGlobal, isLoadingGlobal } = useContext(LoadingGlobalContext);

        const acceptMatch = useCallback(async () => {
            if (!selectedCandidate) return;
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            const references: Candidate[] = candidates.filter((candidate) => candidate.sourceColumn === selectedCandidate.sourceColumn);
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
                if (candidate.targetColumn === selectedCandidate.targetColumn) {
                    return true;
                } else {
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


            if (selectedExplanations && onSuggestions) {
                const explanationObjects = selectedExplanations.map((explanation) => {
                    return {
                        type: explanation.type,
                        content: explanation.content,
                        confidence: explanation.confidence
                    } as ExplanationObject;
                });

                const suggestions = await agentSuggestionsRequest(userOperation, explanationObjects);
                if (suggestions) {
                    onSuggestions(suggestions);
                }
            }

            setIsLoadingGlobal(false);
            
        }, [candidates, selectedCandidate, selectedExplanations, onCandidateUpdate, onCandidateSelect, onSuggestions, isLoadingGlobal, setIsLoadingGlobal]);

        const rejectMatch = useCallback(async () => {
            if (!selectedCandidate) return;
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            const references: Candidate[] = candidates.filter((candidate) => candidate.sourceColumn === selectedCandidate.sourceColumn);
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
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

            if (selectedExplanations && onSuggestions) {
                const explanationObjects = selectedExplanations.map((explanation) => {
                    return {
                        type: explanation.type,
                        content: explanation.content,
                        confidence: explanation.confidence
                    } as ExplanationObject;
                });

                const suggestions = await agentSuggestionsRequest(userOperation, explanationObjects);
                if (suggestions) {
                    onSuggestions(suggestions);
                }
            }

            setIsLoadingGlobal(false);

        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect]);

        const discardColumn = useCallback(async () => {
            if (!selectedCandidate) return;
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            const references: Candidate[] = candidates.filter((candidate) => candidate.sourceColumn === selectedCandidate.sourceColumn);
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
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

            if (selectedExplanations && onSuggestions) {
                const explanationObjects = selectedExplanations.map((explanation) => {
                    return {
                        type: explanation.type,
                        content: explanation.content,
                        confidence: explanation.confidence
                    } as ExplanationObject;
                });

                const suggestions = await agentSuggestionsRequest(userOperation, explanationObjects);
                if (suggestions) {
                    onSuggestions(suggestions);
                }
            }

            setIsLoadingGlobal(false);
        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect]);

        const undo = useCallback(() => {
            const lastOperation = userOperations[userOperations.length - 1];
            if (!lastOperation) return;

            // let newCandidates: Candidate[];
            // switch (lastOperation.operation) {
            //     case 'accept':
            //     case 'discard':
            //         newCandidates = [...candidates, ...lastOperation.references];
            //         newCandidates = newCandidates.sort((a, b) => b.score - a.score);
            //         break;
            //     case 'reject':
            //         newCandidates = [...candidates, lastOperation.candidate];
            //         newCandidates = newCandidates.sort((a, b) => b.score - a.score);
            //         break;
            //     default:
            //         return;
            // }
            // newCandidates = newCandidates.sort((a, b) => b.score - a.score);
            undoUserOperations({ userOperations: [lastOperation], callback: onCandidateUpdate });
            onCandidateSelect(lastOperation.candidate);
            setUserOperations(prev => prev.slice(0, -1));
        }, [candidates, userOperations, onCandidateUpdate, onCandidateSelect]);

        const explain = useCallback(async (candidate?: Candidate) => {
            const candidateToExplain = candidate || selectedCandidate;
            if (!candidateToExplain) return;
            if (isExplaining) return;

            setIsExplaining(true);

            if (onExplanation) {
                const explanation = await candidateExplanationRequest(candidateToExplain);
                if (explanation) {
                    onExplanation(explanation);
                }
            }

            setIsExplaining(false);
        }, [selectedCandidate, onExplanation, isExplaining, setIsExplaining]);

        const apply = useCallback(async (reaction: UserReaction) => {
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            if (onApply) {
                const actionResponses = await agentActionRequest(reaction);
                if (actionResponses) {
                    onApply(actionResponses);
                }
            }

            setIsLoadingGlobal(false);
        }, [onApply, isLoadingGlobal, setIsLoadingGlobal]);

        return {
            userOperations,
            acceptMatch,
            rejectMatch,
            discardColumn,
            undo,
            explain,
            apply,
            isExplaining,
        };
    }
};