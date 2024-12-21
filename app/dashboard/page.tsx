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


export default function Dashboard() {

    const mockData: Candidate[] = [
        {
            sourceColumn: 'A',
            targetColumn: 'B',
            score: 0.5
        },
        {
            sourceColumn: 'A',
            targetColumn: 'C',
            score: 0.2
        },
        {
            sourceColumn: 'B',
            targetColumn: 'A',
            score: 0.1
        },
        {
            sourceColumn: 'B',
            targetColumn: 'C',
            score: 0.6
        },
        {
            sourceColumn: 'C',
            targetColumn: 'A',
            score: 0.9
        },
        {
            sourceColumn: 'C',
            targetColumn: 'B',
            score: 0.4
        },
        {
            sourceColumn: 'A',
            targetColumn: 'D',
            score: 0.7
        },
        {
            sourceColumn: 'B',
            targetColumn: 'D',
            score: 0.3
        },
        {
            sourceColumn: 'C',
            targetColumn: 'D',
            score: 0.8
        },
        {
            sourceColumn: 'A',
            targetColumn: 'E',
            score: 0.1
        },
        {
            sourceColumn: 'A',
            targetColumn: 'F',
            score: 0.8
        },
    ]

    const [candidates, setCandidates] = useState<Candidate[]>(mockData);
    const [sourceClusters, setSourceClusters] = useState<SourceCluster[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(undefined);

    const [sourceColumn, setSourceColumn] = useState<string>(mockData[0].sourceColumn);
    const [candidateType, setCandidateType] = useState<string>('all');
    const [similarSources, setSimilarSources] = useState<number>(5);
    const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);

    const [userOperations, setUserOperations] = useState<UserOperation[]>([]);
    const [openDiagnosisPopup, setOpenDiagnosisPopup] = useState<boolean>(false);
    const [diagnosis, setDiagnosis] = useState<AgentDiagnosis | undefined>(undefined);



    console.log('candidates: ', candidates);

    const fileUploadCallback = (candidates: Candidate[], sourceClusters: SourceCluster[]) => {
        setCandidates(candidates);
        setSourceClusters(sourceClusters);
        setSourceColumn(candidates[0].sourceColumn);
    }

    const chatBoxCallback = (candidates: Candidate[]) => {
        setCandidates(candidates);
        setSourceColumn(candidates[0].sourceColumn);
    }
    
    const setSelectedCandidateCallback = (candidate: Candidate | undefined) => {
        toastify("default", <p><strong>Source: </strong>{candidate?.sourceColumn}, <strong>Target: </strong>{candidate?.targetColumn}</p>, { autoClose: 200 });
        setSelectedCandidate(candidate);
    }

    const acceptMatchCallback = async () => {
        const references: Candidate[] = [];
        if (selectedCandidate) {
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
                references.push(candidate);
                if (candidate.targetColumn === selectedCandidate.targetColumn) {
                    return true;
                } else {
                    return false;
                }
            });
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);

            const userOperation: UserOperation = {
                operation: 'accept',
                candidate: selectedCandidate,
                references: references
            }

            console.log(userOperation);
            toastify("success", <p>Match accepted: <strong>{selectedCandidate.sourceColumn}</strong> - <strong>{selectedCandidate.targetColumn}</strong></p>);
            setUserOperations([...userOperations, userOperation]);
            const agentDiagnosis = await userOperationRequest(userOperation);
            if (agentDiagnosis) {
                setDiagnosis(agentDiagnosis);
                setOpenDiagnosisPopup(true);
            }
        }
    }

    const rejectMatchCallback = () => {
        const references: Candidate[] = [];
        if (selectedCandidate) {
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
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);

            const userOperation: UserOperation = {
                operation: 'reject',
                candidate: selectedCandidate,
                references: references
            }

            console.log(userOperation);
            toastify("success", <p>Match rejected: <strong>{selectedCandidate.sourceColumn}</strong> - <strong>{selectedCandidate.targetColumn}</strong></p>);
            setUserOperations([...userOperations, userOperation]);
        }
    }

    const discardColumnCallback = () => {
        const references: Candidate[] = [];
        if (selectedCandidate) {
            const newCandidates = candidates.filter((candidate) => {
                if (candidate.sourceColumn !== selectedCandidate.sourceColumn) {
                    return true;
                }
                references.push(candidate);
                return false;
            });
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);

            const userOperation: UserOperation = {
                operation: 'discard',
                candidate: selectedCandidate,
                references: references
            }

            console.log(userOperation);
            toastify("success", <p>Column discarded: <strong>{selectedCandidate.sourceColumn}</strong></p>);
            setUserOperations([...userOperations, userOperation]);
        }
    }

    const undoCallback = () => {
        console.log('undo');
        const lastOperation = userOperations.pop();
        if (lastOperation) {
            if (lastOperation.operation === 'accept') {
                let newCandidates = [...candidates, ...lastOperation.references];
                newCandidates = newCandidates.sort((a, b) => b.score - a.score);
                setCandidates(newCandidates);
                setSelectedCandidate(lastOperation.candidate);
            } else if (lastOperation.operation === 'reject') {
                let newCandidates = [...candidates, lastOperation.candidate];
                newCandidates = newCandidates.sort((a, b) => b.score - a.score);
                setCandidates(newCandidates);
                setSelectedCandidate(lastOperation.candidate);
            } else if (lastOperation.operation === 'discard') {
                let newCandidates = [...candidates, ...lastOperation.references];
                newCandidates = newCandidates.sort((a, b) => b.score - a.score);
                setCandidates(newCandidates);
                setSelectedCandidate(lastOperation.candidate);
            }
        }
        setUserOperations(userOperations);
    }

    // Add schema explanation hook
    const {
        matches,
        currentExplanations,
        generateExplanations,
        acceptMatch,
        removeMatch
    } = useSchemaExplanations();

    // Modified setSelectedCandidate callback
    const handleCandidateSelection = (candidate: Candidate | undefined) => {
        setSelectedCandidate(candidate);
        if (candidate) {
            generateExplanations(candidate.sourceColumn, candidate.targetColumn);
        }
    }

    useEffect(() => {
        if (selectedCandidate){
            handleCandidateSelection(selectedCandidate);
        }
    }, [
        selectedCandidate
    ]);

    // Handle accepting a match with explanations
    const handleAcceptMatch = (selectedExplanations: Explanation[]) => {
        if (selectedCandidate) {
            acceptMatch(
                selectedCandidate.sourceColumn,
                selectedCandidate.targetColumn,
                selectedExplanations
            );

            // Update candidates to remove the matched pair
            const newCandidates = candidates.filter(c => 
                !(c.sourceColumn === selectedCandidate.sourceColumn && 
                  c.targetColumn === selectedCandidate.targetColumn)
            );
            setCandidates(newCandidates);
            setSelectedCandidate(undefined);

            // You can also call your existing acceptMatchCallback here if needed
            // acceptMatchCallback();
        }
    };

    useEffect(() => {
        getCachedResults({
            callback: fileUploadCallback
        });
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: "white" }}>
            <ControlPanel
                sourceColumns={Array.from(new Set(candidates.map(candidate => candidate.sourceColumn)))}
                onSourceColumnSelect={(column: string) => {
                    setSourceColumn(column)
                    setSelectedCandidate(undefined)
                }}
                onCandidateTypeSelect={(type: string) => setCandidateType(type)}
                onSimilarSourcesSelect={(num: number) => setSimilarSources(num)}
                onCandidateThresholdSelect={(num: number) => setCandidateThreshold(num)}
                acceptMatch={acceptMatchCallback}
                rejectMatch={rejectMatchCallback}
                discardColumn={discardColumnCallback}
                undo={undoCallback}
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
                            onAcceptMatch={handleAcceptMatch}
                            sourceColumn={selectedCandidate?.sourceColumn}
                            stargetColumn={selectedCandidate?.targetColumn}
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

                    
                    <ChatBox callback={chatBoxCallback}/>
                    <FileUploading callback={fileUploadCallback} />
                </Container>
            </Box>
            {/*  */}
            {/* <ChatBox callback={chatBoxCallback}/> */}

            {/* <FileUploading callback={fileUploadCallback} /> */}

            <AgentDiagnosisPopup open={openDiagnosisPopup} setOpen={setOpenDiagnosisPopup} data={diagnosis} />
        </Box>
    )
}