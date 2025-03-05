'use client';

import { Box, CircularProgress, Typography, Switch } from "@mui/material";
import { AuxColumn } from "./layout/components";
import CombinedView from "./components/explanation/CombinedView";
import { SectionHeader } from "./layout/components";

interface RightPanelProps {
    // CombinedView
    isMatch: boolean;
    currentExplanations: Explanation[];
    selectedExplanations: Explanation[];
    thumbUpExplanations: string[];
    thumbDownExplanations: string[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    setThumbUpExplanations: (id: string[]) => void;
    setThumbDownExplanations: (id: string[]) => void;
    onGenerateExplanation: () => void;
    matchingValues: string[][];
    relevantKnowledge: RelevantKnowledge[];
    isLoading: boolean;
    selectedCandidate?: Candidate;
    gdcAttribute?: GDCAttribute;
    relatedOuterSources: RelatedSource[];
}


const RightPanel = ({
    // CombinedView
    isMatch,
    currentExplanations,
    selectedExplanations,
    thumbUpExplanations,
    thumbDownExplanations,
    setSelectExplanations,
    setThumbUpExplanations,
    setThumbDownExplanations,
    onGenerateExplanation,
    matchingValues,
    relevantKnowledge,
    isLoading,
    selectedCandidate,
    gdcAttribute,
    relatedOuterSources,
}: RightPanelProps) => {
    
    return (
        <AuxColumn>
            <CombinedView
                isMatch={isMatch}
                currentExplanations={currentExplanations}
                selectedExplanations={selectedExplanations}
                thumbUpExplanations={thumbUpExplanations}
                thumbDownExplanations={thumbDownExplanations}
                setSelectExplanations={setSelectExplanations}
                setThumbUpExplanations={setThumbUpExplanations}
                setThumbDownExplanations={setThumbDownExplanations}
                onGenerateExplanation={onGenerateExplanation}
                matchingValues={matchingValues}
                relevantKnowledge={relevantKnowledge}
                isLoading={isLoading}
                selectedCandidate={selectedCandidate}
                gdcAttribute={gdcAttribute}
                relatedOuterSources={relatedOuterSources}
            />
        </AuxColumn>
    );
}
export default RightPanel;