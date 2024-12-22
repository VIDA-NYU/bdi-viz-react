'use client';
import { useEffect, useState } from "react";

import { Container, Toolbar, Box } from "@mui/material";

import { toastify } from "@/app/lib/toastify/toastify-helper";

import ControlPanel from "./components/controlpanel";
import HeatMap from "./components/embed-heatmap/HeatMap";
import FileUploading from "./components/fileuploading";
import ChatBox from "./components/langchain/chatbox";
import AgentDiagnosisPopup from "./components/langchain/diagnosis";
import { userOperationRequest } from "@/app/lib/langchain/agent-helper";
import { getCachedResults } from "@/app/lib/heatmap/heatmap-helper";
import SchemaExplanation from "./components/explanation/SchemaExplanation";
import {useSchemaExplanations} from "./components/explanation/useSchemaExplanations";
import { Explanation } from "./components/explanation/types";
import CombinedView from "./components/explanation/CombinedView";
import { useDashboardCandidates } from "./hooks/useDashboardCandidates";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardOperations } from "./hooks/useDashboardOperations";


export default function Dashboard() {


    const [openDiagnosisPopup, setOpenDiagnosisPopup] = useState(false);
    const [diagnosis, setDiagnosis] = useState<AgentDiagnosis>();

    const {
        candidates,
        setCandidates,
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
        undo
    } = useDashboardOperations({
        candidates,
        selectedCandidate,
        onCandidateUpdate: handleFileUpload,
        onCandidateSelect: setSelectedCandidate,
        onDiagnosis: (newDiagnosis) => {
            setDiagnosis(newDiagnosis);
            setOpenDiagnosisPopup(true);
        }
    });


    // const [candidates, setCandidates] = useState<Candidate[]>(mockData);
    const [sourceClusters, setSourceClusters] = useState<SourceCluster[]>([]);
    // const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);

    // const [sourceColumn, setSourceColumn] = useState<string>(mockData[0].sourceColumn);
    // const [candidateType, setCandidateType] = useState<string>('all');
    // const [similarSources, setSimilarSources] = useState<number>(5);
    // const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);

    const [userOperations, setUserOperations] = useState<UserOperation[]>([]);
    // const [openDiagnosisPopup, setOpenDiagnosisPopup] = useState<boolean>(false);
    // const [diagnosis, setDiagnosis] = useState<AgentDiagnosis | undefined>(undefined);



    // Schema explanation integration
    const {
        matches,
        currentExplanations,
        generateExplanations,
        acceptMatch: acceptMatchWithExplanations,
        removeMatch
    } = useSchemaExplanations(selectedCandidate);

    // const fileUploadCallback = (candidates: Candidate[], sourceClusters: SourceCluster[]) => {
    //     setCandidates(candidates);
    //     setSourceClusters(sourceClusters);
    //     setSourceColumn(candidates[0].sourceColumn);
    // }

    // const chatBoxCallback = (candidates: Candidate[]) => {
    //     setCandidates(candidates);
    //     setSourceColumn(candidates[0].sourceColumn);
    // }
    
    const setSelectedCandidateCallback = (candidate: Candidate | undefined) => {
        toastify("default", <p><strong>Source: </strong>{candidate?.sourceColumn}, <strong>Target: </strong>{candidate?.targetColumn}</p>, { autoClose: 200 });
        setSelectedCandidate(candidate);
    }


    // Modified setSelectedCandidate callback
    const handleCandidateSelection = (candidate: Candidate | undefined) => {
        setSelectedCandidate(candidate);
        if (candidate) {
            generateExplanations(candidate.sourceColumn, candidate.targetColumn);
        }
    }

    
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
                            currentExplanations={currentExplanations}
                            matches={matches}
                            onAcceptMatch={acceptMatchWithExplanations}
                            sourceColumn={selectedCandidate?.sourceColumn}
                            targetColumn={selectedCandidate?.targetColumn}
                            allSourceColumns={Array.from(new Set(candidates.map(c => c.sourceColumn)))}
                            allTargetColumns={Array.from(new Set(candidates.map(c => c.targetColumn)))}
                        />
                    {/* <SchemaExplanation
                            currentExplanations={currentExplanations}
                            matches={matches}
                            onAcceptMatch={handleAcceptMatch}
                            sourceColumn={selectedCandidate?.sourceColumn}
                            targetColumn={selectedCandidate?.targetColumn}
                        /> */}

                    
                    <ChatBox callback={handleChatUpdate}/>
                    <FileUploading callback={handleFileUpload} />
                </Container>
            </Box>
            {/*  */}
            {/* <ChatBox callback={chatBoxCallback}/> */}

            {/* <FileUploading callback={fileUploadCallback} /> */}

            <AgentDiagnosisPopup open={openDiagnosisPopup} setOpen={setOpenDiagnosisPopup} data={diagnosis} />
        </Box>
    )
}