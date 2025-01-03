'use client';
import { useEffect, useState } from "react";

import { Container, Toolbar, Box, CircularProgress } from "@mui/material";

import { toastify } from "@/app/lib/toastify/toastify-helper";

import ControlPanel from "./components/controlpanel";
import HeatMap from "./components/embed-heatmap/HeatMap";
import FileUploading from "./components/fileuploading";
import ChatBox from "./components/langchain/chatbox";
import AgentDiagnosisPopup from "./components/langchain/diagnosis";
import {useSchemaExplanations} from "./components/explanation/useSchemaExplanations";
import CombinedView from "./components/explanation/CombinedView";
import { useDashboardCandidates } from "./hooks/useDashboardCandidates";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardOperations } from "./hooks/useDashboardOperations";
import { useLoadingGlobal } from "./hooks/useLoadingGlobal";


export default function Dashboard() {


    const [openDiagnosisPopup, setOpenDiagnosisPopup] = useState(false);
    const [diagnosis, setDiagnosis] = useState<AgentDiagnosis>();
    const {isLoadingGlobal, setIsLoadingGlobal} = useLoadingGlobal();

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
        acceptMatch,
        rejectMatch,
        discardColumn,
        undo,
        explain,
        suggest,
        isExplaining,
    } = useDashboardOperations({
        candidates,
        selectedCandidate,
        onCandidateUpdate: handleFileUpload,
        onCandidateSelect: setSelectedCandidate,
        onDiagnosis: (newDiagnosis) => {
            setDiagnosis(newDiagnosis);
            setOpenDiagnosisPopup(true);
        },
        onExplanation: (explanation) => {            
            generateExplanations(explanation);
        },
        onSuggestions: (suggestions) => {
            console.log("Suggestions: ", suggestions);
        }
    });



    // Schema explanation integration
    const {
        matches,
        isMatch,
        currentExplanations,
        matchingValues,
        relativeKnowledge,
        generateExplanations,
        acceptMatch: acceptMatchWithExplanations,
        removeMatch
    } = useSchemaExplanations({
        selectedCandidate
    });


    const setSelectedCandidateCallback = (candidate: Candidate | undefined) => {
        if (!candidate) {
            setSelectedCandidate(undefined);
            generateExplanations(undefined);
            return;
        }
        toastify("default", <p><strong>Source: </strong>{candidate?.sourceColumn}, <strong>Target: </strong>{candidate?.targetColumn}</p>, { autoClose: 200 });
        setSelectedCandidate(candidate);
        if (candidate) {
            explain(candidate);
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
                            matchingValues={matchingValues}
                            relativeKnowledge={relativeKnowledge}
                            isLoading={isExplaining}
                            matches={matches}
                            onAcceptMatch={acceptMatchWithExplanations}
                            sourceColumn={selectedCandidate?.sourceColumn}
                            targetColumn={selectedCandidate?.targetColumn}
                            allSourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                            allTargetColumns={Array.from(new Set(candidates.map(c => c.targetColumn)))}
                        />

                    
                    <ChatBox callback={handleChatUpdate}/>
                    <FileUploading callback={handleFileUpload} />
                </Container>
            </Box>

            <AgentDiagnosisPopup
                open={openDiagnosisPopup}
                setOpen={setOpenDiagnosisPopup}
                data={diagnosis}
                suggest={suggest}
            />
            
            {isLoadingGlobal && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            )}

        </Box>
    )
}