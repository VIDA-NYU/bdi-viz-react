'use client';
import { useContext, useEffect, useState } from "react";
import { Container, Toolbar, Box, CircularProgress } from "@mui/material";
import { toastify } from "@/app/lib/toastify/toastify-helper";

import ControlPanel from "./components/controlpanel";
import UpsetPlot from "./components/upset-plot/UpsetPlot";
import StackedHeatMap from "./components/embed-heatmap/stackedHeatMap";
import HeatMap from "./components/embed-heatmap/HeatMap";
import FileUploading from "./components/fileuploading";
import AgentSuggestionsPopup from "./components/langchain/suggestion";
import { useSchemaExplanations } from "./components/explanation/useSchemaExplanations";
import CombinedView from "./components/explanation/CombinedView";
import { useDashboardCandidates } from "./hooks/useDashboardCandidates";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardOperations } from "./hooks/useDashboardOperations";
import LoadingGlobalContext from "@/app/lib/loading/loading-context";
import { getCachedResults } from '@/app/lib/heatmap/heatmap-helper';

export default function Dashboard() {
    const [openSuggestionsPopup, setOpenSuggestionsPopup] = useState(false);
    const [suggestions, setSuggestions] = useState<AgentSuggestions>();
    const { isLoadingGlobal, setIsLoadingGlobal } = useContext(LoadingGlobalContext);

    const {
        candidates,
        sourceClusters,
        matchers,
        selectedCandidate,
        selectedMatchers,
        handleFileUpload,
        handleChatUpdate,
        setSelectedCandidate,
        setSelectedMatchers,
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
                    if (ar.action === "prune" || ar.action === "replace" || ar.action === "redo") {
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
                matchers={matchers}
                selectedMatchers={selectedMatchers}
                onSourceColumnSelect={updateSourceColumn}
                onCandidateTypeSelect={updateCandidateType}
                onSimilarSourcesSelect={updateSimilarSources}
                onCandidateThresholdSelect={updateCandidateThreshold}
                acceptMatch={acceptMatch}
                rejectMatch={rejectMatch}
                discardColumn={discardColumn}
                undo={undo}
                redo={() => {
                    setIsLoadingGlobal(!isLoadingGlobal);
                    console.log('redo')
                }}
                onMatcherSelect={(matcher) => {
                    setSelectedMatchers(matcher);
                    console.log("Selected Matcher: ", matcher);
                }}
            />
            <Toolbar />
            <Box component="main" sx={{ flexGrow: 1, py: 4, paddingTop: "200px" }}>
                <Container maxWidth="lg">
                    <UpsetPlot
                        data={candidates}
                        matchers={matchers}
                        filters={{ selectedCandidate, sourceColumn, candidateType, candidateThreshold }}
                    />
                    {selectedMatchers.length > 1 ? (
                        <StackedHeatMap 
                            data={candidates}
                            sourceClusters={sourceClusters}
                            selectedMatchers={selectedMatchers}
                            setSelectedCandidate={setSelectedCandidateCallback}
                            filters={{ selectedCandidate, sourceColumn, candidateType, similarSources, candidateThreshold }}
                        />
                    ) : (
                        <HeatMap
                            data={candidates}
                            sourceClusters={sourceClusters}
                            selectedMatchers={selectedMatchers}
                            setSelectedCandidate={setSelectedCandidateCallback}
                            filters={{ selectedCandidate, sourceColumn, candidateType, similarSources, candidateThreshold }}
                        />
                    )}
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
                <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300 }}>
                    <CircularProgress size={80} />
                </Box>
            )}
        </Box>
    );
}
