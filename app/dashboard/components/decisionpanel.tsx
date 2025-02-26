"use client";

import { Box } from "@mui/material";
import AcceptMatchButton from "./control-inputs/accept-match-button";
import RejectMatchButton from "./control-inputs/reject-match-button";
import DiscardColumnButton from "./control-inputs/discard-column-button";
import UndoButton from "./control-inputs/undo-button";
import RedoButton from "./control-inputs/redo-button";
// import FilterEasyCasesButton from "./control-inputs/filter-easy-cases-button";
import ExportMatchingResultsButton from "./control-inputs/export-matching-results";
import { SectionHeader } from "../layout/components";


interface DecisionPanelProps {
    acceptMatch: () => void;
    rejectMatch: () => void;
    discardColumn: () => void;
    undo: () => void;
    redo: () => void;
    // filterEasyCases: () => void;
    exportMatchingResults: () => void;
}

const rootStyles = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    minWidth: "min-content",
    gap: 1,
};


const DecisionPanel: React.FC<DecisionPanelProps> = ({
    acceptMatch,
    rejectMatch,
    discardColumn,
    undo,
    redo,
    exportMatchingResults
}) => {

    return (
        <Box sx={rootStyles}>
            <SectionHeader>
                Decision Panel
            </SectionHeader>
            <Box sx={rootStyles}>
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <AcceptMatchButton onClick={acceptMatch} />
                    <RejectMatchButton onClick={rejectMatch} />
                    <DiscardColumnButton onClick={discardColumn} />
                </Box>
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <UndoButton onClick={undo} />
                    <RedoButton onClick={redo} />
                    <ExportMatchingResultsButton onClick={exportMatchingResults} />
                </Box>
                {/* <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                    
                </Box> */}
            </Box>
        </Box>
    )
}

export default DecisionPanel;