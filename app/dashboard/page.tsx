'use client';
import { useEffect, useState } from "react";
import { Container, Toolbar, Box, CircularProgress } from "@mui/material";
import { toastify } from "@/app/lib/toastify/toastify-helper";

import ControlPanel from "./components/controlpanel";
import HeatMap from "./components/embed-heatmap/HeatMap";
import FileUploading from "./components/fileuploading";
import ChatBox from "./components/langchain/chatbox";
import AgentSuggestionsPopup from "./components/langchain/suggestion";
import { useSchemaExplanations } from "./components/explanation/useSchemaExplanations";
import CombinedView from "./components/explanation/CombinedView";
import { useDashboardCandidates } from "./hooks/useDashboardCandidates";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardOperations } from "./hooks/useDashboardOperations";
import { useLoadingGlobal } from "./hooks/useLoadingGlobal";
import { getCachedResults } from '@/app/lib/heatmap/heatmap-helper';

export default function Dashboard() {
    const [openSuggestionsPopup, setOpenSuggestionsPopup] = useState(false);
    const [suggestions, setSuggestions] = useState<AgentSuggestions>();
    const { isLoadingGlobal } = useLoadingGlobal();

    const {
        candidates,
        sourceClusters,
        selectedCandidate,
        handleFileUpload,
        handleChatUpdate,
        setSelectedCandidate
    } = useDashboardCandidates();

    const {
        sourceColumn,
        candidateType,
        similarSources,
        candidateThreshold,
        updateSourceColumn,
        updateCandidateType,
        updateSimilarSources,
        updateCandidateThreshold
    } = useDashboardFilters();

    const {
        matches,
        isMatch,
        currentExplanations,
        selectedExplanations,
        matchingValues,
        relativeKnowledge,
        generateExplanations,
        setSelectedExplanations,
        acceptMatch: acceptMatchWithExplanations,
        removeMatch
    } = useSchemaExplanations({ selectedCandidate });

    const {
        userOperations,
        acceptMatch,
        rejectMatch,
        discardColumn,
        undo,
        explain,
        apply,
        isExplaining,
    } = useDashboardOperations({
        candidates,
        selectedCandidate,
        selectedExplanations,
        onCandidateUpdate: handleFileUpload,
        onCandidateSelect: setSelectedCandidate,
        onExplanation: generateExplanations,
        onSuggestions: (suggestions) => {
            console.log("Suggestions: ", suggestions);
            setSuggestions(suggestions);
            setOpenSuggestionsPopup(true);
        },
        onApply: (actionResponses) => {
            console.log("Action Responses: ", actionResponses);
            if (actionResponses && actionResponses.length > 0) {
                actionResponses.forEach((ar) => {
                    if (ar.action === "prune" || ar.action === "replace") {
                        getCachedResults({ callback: handleFileUpload });
                    } else {
                        console.log("Action not supported: ", ar.action);
                    }
                });
            }
        }
    });

    const setSelectedCandidateCallback = (candidate: Candidate | undefined) => {
        if (!candidate) {
            setSelectedCandidate(undefined);
            generateExplanations(undefined);
            return;
        }
        toastify("default", <p><strong>Source: </strong>{candidate.sourceColumn}, <strong>Target: </strong>{candidate.targetColumn}</p>, { autoClose: 200 });
        setSelectedCandidate(candidate);
        explain(candidate);
    };

    const onSelectedActions = (actions: AgentAction[]) => {
        if (actions && actions.length > 0) {
            const previousOperation = userOperations[userOperations.length - 1];
            const reaction: UserReaction = {
                actions,
                previousOperation,
            };
            console.log("Reaction: ", reaction);
            apply(reaction);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: "white" }}>
            <ControlPanel
                sourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                onSourceColumnSelect={updateSourceColumn}
                onCandidateTypeSelect={updateCandidateType}
                onSimilarSourcesSelect={updateSimilarSources}
                onCandidateThresholdSelect={updateCandidateThreshold}
                acceptMatch={acceptMatch}
                rejectMatch={rejectMatch}
                discardColumn={discardColumn}
                undo={undo}
                redo={() => console.log('redo')}
                explain={() => explain()}
            />
            <Toolbar />
            <Box component="main" sx={{ flexGrow: 1, py: 4, paddingTop: "200px" }}>
                <Container maxWidth="lg">
                    <HeatMap 
                        data={candidates}
                        sourceClusters={sourceClusters}
                        setSelectedCandidate={setSelectedCandidateCallback}
                        filters={{ selectedCandidate, sourceColumn, candidateType, similarSources, candidateThreshold }}
                    />
                    <CombinedView
                        isMatch={isMatch}
                        currentExplanations={currentExplanations}
                        selectedExplanations={selectedExplanations}
                        setSelectExplanations={setSelectedExplanations}
                        matchingValues={matchingValues}
                        relativeKnowledge={relativeKnowledge}
                        isLoading={isExplaining}
                        matches={matches}
                        sourceColumn={selectedCandidate?.sourceColumn}
                        targetColumn={selectedCandidate?.targetColumn}
                        allSourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                        allTargetColumns={Array.from(new Set(candidates.map(c => c.targetColumn)))}
                    />
                    <ChatBox callback={handleChatUpdate} />
                    <FileUploading callback={handleFileUpload} />
                </Container>
            </Box>
            <AgentSuggestionsPopup
                open={openSuggestionsPopup}
                setOpen={setOpenSuggestionsPopup}
                data={suggestions}
                onSelectedActions={onSelectedActions}
            />
            {isLoadingGlobal && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}
