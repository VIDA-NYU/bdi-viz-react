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
    matchingValues: string[][];
    relevantKnowledge: RelevantKnowledge[];
    isLoading: boolean;
    sourceColumn?: string;
    targetColumn?: string;
    gdcAttribute?: GDCAttribute;
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
    matchingValues,
    relevantKnowledge,
    isLoading,
    sourceColumn,
    targetColumn,
    gdcAttribute
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
                matchingValues={matchingValues}
                relevantKnowledge={relevantKnowledge}
                isLoading={isLoading}
                sourceColumn={sourceColumn}
                targetColumn={targetColumn}
                gdcAttribute={gdcAttribute}
            />
        </AuxColumn>
    );
}
export default RightPanel;