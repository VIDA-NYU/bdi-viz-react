'use client';
import { useContext, useState, useCallback } from "react";
import { Box, CircularProgress, Typography, Switch } from "@mui/material";
import { toastify } from "@/app/lib/toastify/toastify-helper";

import SearchBar from "./components/search/searchBar";
import LeftPanel from "./leftpanel";
import UpperTabs from "./components/upperTabs";
import LowerTabs from "./components/lowerTabs";
import RightPanel from "./rightpanel";
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
    MainColumn,
} from "./layout/components";
import { useDashboardHighlight } from "./hooks/useDashboardHighlight";

export default function Dashboard() {
    const [openSuggestionsPopup, setOpenSuggestionsPopup] = useState(false);
    const [suggestions, setSuggestions] = useState<AgentSuggestions>();
    const {
        isLoadingGlobal,
        setIsLoadingGlobal,
        developerMode,
        setDeveloperMode,
    } = useContext(LoadingGlobalContext);

    const {
        candidates,
        sourceClusters,
        matchers,
        selectedCandidate,
        sourceUniqueValues,
        targetUniqueValues,
        valueMatches,
        userOperations,
        targetOntologies,
        gdcAttribute,
        handleFileUpload,
        setSelectedCandidate,
        setMatchers,
        handleUserOperationsUpdate,
        handleValueMatches,
    } = useDashboardCandidates();

    const {
        sourceColumn,
        candidateType,
        similarSources,
        candidateThreshold,
        searchResults,
        status,
        updateSourceColumn,
        updateCandidateType,
        updateSimilarSources,
        updateCandidateThreshold,
        updateSearchResults,
        updateStatus,
    } = useDashboardFilters({ candidates, sourceClusters, matchers });

    const {
        isMatch,
        currentExplanations,
        selectedExplanations,
        thumbUpExplanations,
        thumbDownExplanations,
        matchingValues,
        relevantKnowledge,
        setIsMatch,
        generateExplanations,
        setSelectedExplanations,
        setThumbUpExplanations,
        setThumbDownExplanations,
    } = useSchemaExplanations();

    const {
        acceptMatch,
        rejectMatch,
        discardColumn,
        undo,
        redo,
        explain,
        apply,
        // filterExactMatches,
        exportMatchingResults,
        isExplaining,
    } = useDashboardOperations({
        candidates,
        selectedCandidate,
        selectedExplanations,
        onCandidateUpdate: handleFileUpload,
        onCandidateSelect: setSelectedCandidate,
        onExplanation: generateExplanations,
        onSuggestions: handleSuggestions,
        onApply: handleApply,
        onExactMatches: handleExactMatches,
        onUserOperationsUpdate: handleUserOperationsUpdate,
    });

    const {
        filteredCandidates,
        filteredSourceCluster,
        filteredCandidateCluster,
        weightedAggregatedCandidates,
        filteredSourceColumns,
    } = useDashboardInterfaces({
        candidates,
        sourceClusters,
        matchers,
        filters: {
            selectedCandidate,
            sourceColumn,
            candidateType,
            similarSources,
            candidateThreshold,
            status,
        }
    });

    const {
        highlightedSourceColumns,
        highlightedTargetColumns,
        updateHighlightedSourceColumns,
        updateHighlightedTargetColumns
    } = useDashboardHighlight({candidates, searchResults});

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

    function handleExactMatches(exactMatches: Candidate[]) {
        console.log("Exact Matches: ", exactMatches);
        getCachedResults({ callback: handleFileUpload });
    }

    function setSelectedCandidateCallback(candidate: Candidate | undefined) {
        if (!candidate) {
            setSelectedCandidate(undefined);
            generateExplanations(undefined);
            return;
        }
        toastify("default", <p><strong>Source: </strong>{candidate.sourceColumn}, <strong>Target: </strong>{candidate.targetColumn}</p>, { autoClose: 200 });
        setSelectedCandidate(candidate);

        if (!(candidate as AggregatedCandidate).matchers.includes("candidate_quadrants")) {
            explain(candidate);
        } else {
            setIsMatch(true);
        }
    }

    function onGenerateExplanation() {
        toastify("default", `Generating explanations for ${selectedCandidate?.sourceColumn}...`, { autoClose: 200 });
        if (selectedCandidate) {
            explain(selectedCandidate);
        }
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

    function handleSearchResults(results: Candidate[]) {
        console.log("Search Results: ", results);
        updateSearchResults(results);
    }

    return (
        <RootContainer>
            <Header>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center">
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: "200" }}>BDI Visualization System</Typography>
                        <Box display="flex" alignItems="center" width="400pt">
                            <SearchBar agentSearchResultCallback={handleSearchResults} />
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ fontSize: "1rem", fontWeight: "300", marginRight: 0 }}>Developer Mode</Typography>
                            <Switch
                                checked={developerMode}
                                onChange={(e) => setDeveloperMode(e.target.checked)}
                                color="default"
                            />
                        </Box>
                    </Box>
                </Box>
            </Header>

            <MainContent>
                <LeftPanel
                    containerStyle={{ marginBottom: 0, flexGrow: 0 }}
                    sourceColumns={filteredSourceColumns}
                    matchers={matchers}
                    onSourceColumnSelect={handleUpdateSourceColumn}
                    onCandidateTypeSelect={updateCandidateType}
                    onSimilarSourcesSelect={updateSimilarSources}
                    onCandidateThresholdSelect={updateCandidateThreshold}
                    acceptMatch={acceptMatch}
                    rejectMatch={rejectMatch}
                    discardColumn={discardColumn}
                    undo={undo}
                    redo={redo}
                    exportMatchingResults={exportMatchingResults}
                    onMatchersSelect={(matchers: Matcher[]) => {
                        setMatchers(matchers);
                    }}
                    state={{ sourceColumn, candidateType, similarSources, candidateThreshold }}
                    userOperations={userOperations}
                    handleFileUpload={handleFileUpload}
                />

                    {/* <DualScatter
                        candidates={weightedAggregatedCandidates}
                        updateHighlightSourceColumns={
                            updateHighlightedSourceColumns
                        }
                        updateHighlightTargetColumns={
                            updateHighlightedTargetColumns
                        }
                        width={300}
                        height={300}
                    /> */}

                {/* Middle Column - Main Visualizations */}
                <MainColumn>
                    <UpperTabs
                        weightedAggregatedCandidates={weightedAggregatedCandidates}
                        sourceColumn={sourceColumn}
                        sourceColumns={filteredSourceColumns}
                        sourceCluster={filteredSourceCluster}
                        targetOntologies={targetOntologies}
                        selectedCandidate={selectedCandidate}
                        setSelectedCandidate={setSelectedCandidateCallback}
                        sourceUniqueValues={sourceUniqueValues}
                        targetUniqueValues={targetUniqueValues}
                        highlightSourceColumns={highlightedSourceColumns}
                        highlightTargetColumns={highlightedTargetColumns}
                        updateStatus={updateStatus}
                    />
                    <LowerTabs
                        weightedAggregatedCandidates={weightedAggregatedCandidates}
                        matchers={matchers}
                        selectedCandidate={selectedCandidate}
                        selectedSourceColumn={sourceColumn}
                        valueMatches={valueMatches}
                        handleValueMatches={handleValueMatches}
                    />
                </MainColumn>

                {/* Right Column - Auxiliary Visualizations */}
                <RightPanel
                    isMatch={isMatch}
                    currentExplanations={currentExplanations}
                    selectedExplanations={selectedExplanations}
                    thumbUpExplanations={thumbUpExplanations}
                    thumbDownExplanations={thumbDownExplanations}
                    matchingValues={matchingValues}
                    relevantKnowledge={relevantKnowledge}
                    isLoading={isExplaining}
                    setSelectExplanations={setSelectedExplanations}
                    setThumbUpExplanations={setThumbUpExplanations}
                    setThumbDownExplanations={setThumbDownExplanations}
                    selectedCandidate={selectedCandidate}
                    onGenerateExplanation={onGenerateExplanation}
                    gdcAttribute={gdcAttribute}
                />
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
