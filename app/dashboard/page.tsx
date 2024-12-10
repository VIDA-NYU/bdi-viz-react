'use client';
import { useState } from "react";

import { Container } from "@mui/material";

import ControlPanel from "./components/controlpanel";
import HeatMap from "./components/heatmap";
import FileUploading from "./components/fileuploading";
import ChatBox from "./components/langchain/chatbox";


export default function Page() {

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

    const [sourceColumn, setSourceColumn] = useState<string>(mockData[0].sourceColumn);
    const [candidateType, setCandidateType] = useState<string>('all');
    const [similarSources, setSimilarSources] = useState<number>(5);
    const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);

    const fileUploadCallback = (candidates: Candidate[]) => {
        setCandidates(candidates);
        setSourceColumn(candidates[0].sourceColumn);
    }


    return (
        <div>
            <ControlPanel
                sourceColumns={Array.from(new Set(candidates.map(candidate => candidate.sourceColumn)))}
                onSourceColumnSelect={(column: string) => setSourceColumn(column)}
                onCandidateTypeSelect={(type: string) => setCandidateType(type)}
                onSimilarSourcesSelect={(num: number) => setSimilarSources(num)}
                onCandidateThresholdSelect={(num: number) => setCandidateThreshold(num)}

                acceptMatch={() => console.log('accept')}
                rejectMatch={() => console.log('reject')}
                discardColumn={() => console.log('discard')}
                undo={() => console.log('undo')}
                redo={() => console.log('redo')}
            />
            <Container
                maxWidth="lg"
                component="main"
                sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
            >
            <HeatMap 
                data={candidates} 
                filters={{ sourceColumn, candidateType, similarSources, candidateThreshold }}
            />
            </Container>

            <ChatBox />

            <FileUploading callback={fileUploadCallback} />
        </div>
    )
}