import { useState, useCallback, useContext } from 'react';
import type { Candidate } from '../types';
import { toastify } from "@/app/lib/toastify/toastify-helper";
import { applyUserOperation, undoUserOperation, redoUserOperation, getExactMatches } from "@/app/lib/heatmap/heatmap-helper";
import { candidateExplanationRequest, agentSuggestionsRequest, agentActionRequest } from "@/app/lib/langchain/agent-helper";
import LoadingGlobalContext from "@/app/lib/loading/loading-context";

type DashboardOperationProps = {
    candidates: Candidate[];
    selectedCandidate: Candidate | undefined;
    selectedExplanations?: Explanation[];
    onCandidateUpdate: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
    onCandidateSelect: (candidate: Candidate | undefined) => void;
    onExplanation?: (explanation: CandidateExplanation | undefined) => void;
    onSuggestions?: (suggestions: AgentSuggestions | undefined) => void;
    onApply?: (actionResponses: ActionResponse[] | undefined) => void;
    onExactMatches?: (exactMatches: Candidate[]) => void;
    onUserOperationsUpdate: (userOperations: UserOperation[]) => void;
}

type DashboardOperationState = {
    isExplaining: boolean;
    acceptMatch: () => Promise<void>;
    rejectMatch: () => void;
    discardColumn: () => void;
    undo: () => void;
    redo: () => void;
    explain: (candidate?: Candidate) => void;
    apply: (reaction: UserReaction) => void;
    filterExactMatches: () => void;
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
        onExactMatches,
        onUserOperationsUpdate,
    }: DashboardOperationProps): DashboardOperationState => {
        const [isExplaining, setIsExplaining] = useState<boolean>(false);
        const { setIsLoadingGlobal, isLoadingGlobal } = useContext(LoadingGlobalContext);

        const acceptMatch = useCallback(async () => {
            if (!selectedCandidate) return;
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            const references: Candidate[] = candidates.filter((candidate) => candidate.sourceColumn === selectedCandidate.sourceColumn);
            const userOperation: UserOperation = {
                operation: 'accept',
                candidate: selectedCandidate,
                references
            };

            onCandidateSelect(undefined);

            toastify("success", <p>Match accepted: <strong>{selectedCandidate.sourceColumn}</strong> - <strong>{selectedCandidate.targetColumn}</strong></p>);


            // if (selectedExplanations && onSuggestions) {
            //     const explanationObjects = selectedExplanations.map((explanation) => {
            //         return {
            //             type: explanation.type,
            //             content: explanation.content,
            //             confidence: explanation.confidence
            //         } as ExplanationObject;
            //     });

            //     const suggestions = await agentSuggestionsRequest(userOperation, explanationObjects);
            //     if (suggestions) {
            //         onSuggestions(suggestions);
            //     }
            // }
            
            applyUserOperation({
                userOperations: [userOperation],
                cachedResultsCallback: (candidates: Candidate[]) => {
                    onCandidateUpdate(candidates);
                },
                userOperationHistoryCallback(userOperations: UserOperation[]) {
                    onUserOperationsUpdate(userOperations);
                }
            });

            setIsLoadingGlobal(false);
            
        }, [candidates, selectedCandidate, selectedExplanations, onCandidateUpdate, onCandidateSelect, onSuggestions, isLoadingGlobal, setIsLoadingGlobal]);

        const rejectMatch = useCallback(async () => {
            if (!selectedCandidate) return;
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            const references: Candidate[] = candidates.filter((candidate) => candidate.sourceColumn === selectedCandidate.sourceColumn);
            const userOperation: UserOperation = {
                operation: 'reject',
                candidate: selectedCandidate,
                references
            };

            onCandidateSelect(undefined);
            
            toastify("success", <p>Match rejected: <strong>{selectedCandidate.sourceColumn}</strong> - <strong>{selectedCandidate.targetColumn}</strong></p>);

            // if (selectedExplanations && onSuggestions) {
            //     const explanationObjects = selectedExplanations.map((explanation) => {
            //         return {
            //             type: explanation.type,
            //             content: explanation.content,
            //             confidence: explanation.confidence
            //         } as ExplanationObject;
            //     });

            //     const suggestions = await agentSuggestionsRequest(userOperation, explanationObjects);
            //     if (suggestions) {
            //         onSuggestions(suggestions);
            //     }
            // }

            applyUserOperation({
                userOperations: [userOperation],
                cachedResultsCallback: (candidates: Candidate[]) => {
                    onCandidateUpdate(candidates);
                },
                userOperationHistoryCallback(userOperations: UserOperation[]) {
                    onUserOperationsUpdate(userOperations);
                }
            });

            setIsLoadingGlobal(false);

        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect]);

        const discardColumn = useCallback(async () => {
            if (!selectedCandidate) return;
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            const references: Candidate[] = candidates.filter((candidate) => candidate.sourceColumn === selectedCandidate.sourceColumn);

            onCandidateSelect(undefined);

            const userOperation: UserOperation = {
                operation: 'discard',
                candidate: selectedCandidate,
                references
            };

            toastify("success", <p>Column discarded: <strong>{selectedCandidate.sourceColumn}</strong></p>);

            // if (selectedExplanations && onSuggestions) {
            //     const explanationObjects = selectedExplanations.map((explanation) => {
            //         return {
            //             type: explanation.type,
            //             content: explanation.content,
            //             confidence: explanation.confidence
            //         } as ExplanationObject;
            //     });

            //     const suggestions = await agentSuggestionsRequest(userOperation, explanationObjects);
            //     if (suggestions) {
            //         onSuggestions(suggestions);
            //     }
            // }

            applyUserOperation({
                userOperations: [userOperation],
                cachedResultsCallback: (candidates: Candidate[]) => {
                    onCandidateUpdate(candidates);
                },
                userOperationHistoryCallback(userOperations: UserOperation[]) {
                    onUserOperationsUpdate(userOperations);
                }
            });

            setIsLoadingGlobal(false);
        }, [candidates, selectedCandidate, onCandidateUpdate, onCandidateSelect]);

        const undo = useCallback(() => {
            undoUserOperation({
                userOperationCallback: (userOperation: UserOperation) => {
                    toastify("info", <p>Operation undone: <strong>{userOperation.operation}</strong> - <strong>{userOperation.candidate.sourceColumn}</strong> - <strong>{userOperation.candidate.targetColumn}</strong></p>);
                    onCandidateSelect(userOperation.candidate);
                },
                cachedResultsCallback: (candidates: Candidate[]) => {
                    onCandidateUpdate(candidates);
                },
                userOperationHistoryCallback(userOperations: UserOperation[]) {
                    onUserOperationsUpdate(userOperations);
                },
            });
            
        }, [candidates, onCandidateUpdate, onCandidateSelect]);

        const redo = useCallback(() => {
            redoUserOperation({
                userOperationCallback: (userOperation: UserOperation) => {
                    toastify("info", <p>Operation redone: <strong>{userOperation.operation}</strong> - <strong>{userOperation.candidate.sourceColumn}</strong> - <strong>{userOperation.candidate.targetColumn}</strong></p>);
                    onCandidateSelect(userOperation.candidate);
                },
                cachedResultsCallback: (candidates: Candidate[]) => {
                    onCandidateUpdate(candidates);
                },
                userOperationHistoryCallback(userOperations: UserOperation[]) {
                    onUserOperationsUpdate(userOperations);
                },
            });
        }, [candidates, onCandidateUpdate, onCandidateSelect]);
            

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

        const filterExactMatches = useCallback(async () => {
            if (isLoadingGlobal) return;

            setIsLoadingGlobal(true);

            if (onExactMatches) {
                const exactMatches = await getExactMatches({
                    callback: onExactMatches
                });

                console.log("Exact Matches: ", exactMatches);
            }

            setIsLoadingGlobal(false);
        }, [onCandidateUpdate, isLoadingGlobal, setIsLoadingGlobal]);


        return {
            acceptMatch,
            rejectMatch,
            discardColumn,
            undo,
            redo,
            explain,
            apply,
            filterExactMatches,
            isExplaining,
        };
    }
};