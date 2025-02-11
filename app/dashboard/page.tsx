'use client';
import { useContext, useState } from "react";
import { Container, Toolbar, Box, CircularProgress, Button, Typography } from "@mui/material";
import { toastify } from "@/app/lib/toastify/toastify-helper";

import ControlPanel from "./components/controlpanel";
import UpperTabs from "./components/upperTabs";
import LowerTabs from "./components/lowerTabs";
import FileUploading from "./components/fileuploading";
import CombinedView from "./components/explanation/CombinedView";
import { SchemaMatch } from "./components/explanation/types";
import { AuxColumn } from "./layout/components";
import { DualScatter } from "./components/dual-scatter/DualScatter";
import AgentSuggestionsPopup from "./components/langchain/suggestion";
import LoadingGlobalContext from "@/app/lib/loading/loading-context";
import { getCachedResults } from '@/app/lib/heatmap/heatmap-helper';

import { useSchemaExplanations } from "./components/explanation/useSchemaExplanations";
import { useDashboardCandidates } from "./hooks/useDashboardCandidates";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardOperations } from "./hooks/useDashboardOperations";
import { useDashboardInterfaces } from "./hooks/useDashboardInterfaces";

import {
    RootContainer,
    Header,
    MainContent,
    ControlColumn,
    MainColumn,
} from "./layout/components";

export default function Dashboard() {
    const [openSuggestionsPopup, setOpenSuggestionsPopup] = useState(false);
    const [suggestions, setSuggestions] = useState<AgentSuggestions>();
    const { isLoadingGlobal, setIsLoadingGlobal } = useContext(LoadingGlobalContext);

    const {
        candidates,
        sourceClusters,
        matchers,
        selectedCandidate,
        sourceUniqueValues,
        targetUniqueValues,
        valueMatches,
        handleFileUpload,
        setSelectedCandidate,
    } = useDashboardCandidates();

    const {
        sourceColumn,
        candidateType,
        similarSources,
        candidateThreshold,
        selectedMatcher,
        updateSourceColumn,
        updateCandidateType,
        updateSimilarSources,
        updateCandidateThreshold,
        updateSelectedMatcher,
    } = useDashboardFilters({ candidates, sourceClusters, matchers });

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
        onSuggestions: handleSuggestions,
        onApply: handleApply
    });

    const {
        filteredCandidates,
        filteredSourceCluster,
        filteredCandidateCluster,
    } = useDashboardInterfaces({
        candidates,
        sourceClusters,
        matchers,
        candidateClusters: [],
        filters: {
            selectedCandidate,
            sourceColumn,
            candidateType,
            similarSources,
            candidateThreshold,
            selectedMatcher,
        }
    });

    function handleSuggestions(suggestions: AgentSuggestions | undefined) {
        console.log("Suggestions: ", suggestions);
        setSuggestions(suggestions);
        getCachedResults({ callback: handleFileUpload });
        setOpenSuggestionsPopup(true);
    }

    function handleApply(actionResponses: ActionResponse[] | undefined) {
        console.log("Action Responses: ", actionResponses);
        if (actionResponses && actionResponses.length > 0) {
            actionResponses.forEach((ar) => {
                if (["prune", "replace", "redo"].includes(ar.action)) {
                    getCachedResults({ callback: handleFileUpload });
                } else {
                    console.log("Action not supported: ", ar.action);
                }
            });
        }
    }

    function setSelectedCandidateCallback(candidate: Candidate | undefined) {
        if (!candidate) {
            setSelectedCandidate(undefined);
            generateExplanations(undefined);
            return;
        }
        toastify("default", <p><strong>Source: </strong>{candidate.sourceColumn}, <strong>Target: </strong>{candidate.targetColumn}</p>, { autoClose: 200 });
        setSelectedCandidate(candidate);
        explain(candidate);
    }

    function onSelectedActions(actions: AgentAction[]) {
        if (actions && actions.length > 0) {
            const previousOperation = userOperations[userOperations.length - 1];
            const reaction: UserReaction = {
                actions,
                previousOperation,
            };
            console.log("Reaction: ", reaction);
            apply(reaction);
        }
    }

    function handleUpdateSourceColumn(column: string) {
        setSelectedCandidate(undefined);
        updateSourceColumn(column);
    }

    return (
        <RootContainer>
            <Header>
                <Typography variant="h5">BDI Visualization System</Typography>
            </Header>

            <MainContent>
                <ControlColumn>
                    <ControlPanel
                        containerStyle={{ marginBottom: 0, flexGrow: 0 }}
                        sourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                        matchers={matchers}
                        onSourceColumnSelect={handleUpdateSourceColumn}
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
                            updateSelectedMatcher(matcher);
                            console.log("Selected Matcher: ", matcher);
                        }}
                        state={{ sourceColumn, candidateType, similarSources, candidateThreshold, selectedMatcher }}
                    />

                    <DualScatter
                        candidates={filteredCandidates}
                        width={300}
                        height={300}
                    />
                </ControlColumn>

                {/* Middle Column - Main Visualizations */}
                <MainColumn>
                    <UpperTabs
                        filteredCandidates={filteredCandidates}
                        matchers={matchers}
                        selectedCandidate={selectedCandidate}
                        selectedSourceColumn={sourceColumn}
                        isMatch={isMatch}
                        currentExplanations={currentExplanations}
                        selectedExplanations={selectedExplanations}
                        setSelectExplanations={setSelectedExplanations}
                        matchingValues={matchingValues}
                        relativeKnowledge={relativeKnowledge}
                        isLoading={isExplaining}
                        matches={matches}
                        allSourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                        allTargetColumns={Array.from(new Set(candidates.map(c => c.targetColumn)))}
                        valueMatches={valueMatches}
                    />
                    <LowerTabs
                        candidates={filteredCandidates}
                        sourceCluster={filteredSourceCluster}
                        selectedCandidate={selectedCandidate}
                        setSelectedCandidate={setSelectedCandidateCallback}
                        selectedMatcher={selectedMatcher}
                        sourceUniqueValues={sourceUniqueValues}
                        targetUniqueValues={targetUniqueValues}
                    />
                </MainColumn>

                {/* Right Column - Auxiliary Visualizations */}
                <AuxColumn>
                    <FileUploading callback={handleFileUpload} />
                    
                    <CombinedView
                        isMatch={isMatch}
                        currentExplanations={currentExplanations}
                        selectedExplanations={selectedExplanations}
                        matchingValues={matchingValues}
                        relativeKnowledge={relativeKnowledge}
                        matches={matches as SchemaMatch[]}
                        isLoading={isExplaining}
                        setSelectExplanations={setSelectedExplanations}
                        sourceColumn={selectedCandidate?.sourceColumn}
                        targetColumn={selectedCandidate?.targetColumn}
                        allSourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                        allTargetColumns={Array.from(new Set(candidates.map(c => c.targetColumn)))}
                    />
                    {/* <MediumVizContainer>
            <Typography variant="h6">Value Distribution</Typography>
          </MediumVizContainer> */}

                </AuxColumn>
            </MainContent>

            {/* Loading Overlay */}
            {isLoadingGlobal && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1300,
                }}>
                    <CircularProgress size={80} />
                </Box>
            )}

            {/* Popups */}
            <AgentSuggestionsPopup
                open={openSuggestionsPopup}
                setOpen={setOpenSuggestionsPopup}
                data={suggestions}
                onSelectedActions={onSelectedActions}
            />
        </RootContainer>
    );
}
