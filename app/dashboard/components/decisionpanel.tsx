"use client";

import { Box, Typography } from "@mui/material";
import AcceptMatchButton from "./control-inputs/accept-match-button";
import RejectMatchButton from "./control-inputs/reject-match-button";
import DiscardColumnButton from "./control-inputs/discard-column-button";
import UndoButton from "./control-inputs/undo-button";
import RedoButton from "./control-inputs/redo-button";
import FilterEasyCasesButton from "./control-inputs/filter-easy-cases-button";


interface DecisionPanelProps {
    acceptMatch: () => void;
    rejectMatch: () => void;
    discardColumn: () => void;
    undo: () => void;
    redo: () => void;
    filterEasyCases: () => void;
}

const rootStyles = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    minWidth: "min-content",
    gap: 2,
};


const DecisionPanel: React.FC<DecisionPanelProps> = ({
    acceptMatch,
    rejectMatch,
    discardColumn,
    undo,
    redo,
    filterEasyCases
}) => {

    return (
        <Box sx={rootStyles}>
            <Typography
                variant="h6"
                component="div"
                sx={{
                    display: { xs: "none", sm: "flex" },
                    color: "#000",
                    whiteSpace: "nowrap"
                }}
                >
                Decision Panel
            </Typography>
            <Box sx={rootStyles}>
                <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                    <AcceptMatchButton onClick={acceptMatch} />
                    <RejectMatchButton onClick={rejectMatch} />
                    <DiscardColumnButton onClick={discardColumn} />
                </Box>
                <Box sx={{ display: "flex", gap: 1, minWidth: "min-content", alignContent: "flex-start", justifyContent: "flex-start" }}>
                    <UndoButton onClick={undo} />
                    <RedoButton onClick={redo} />
                    <FilterEasyCasesButton onClick={filterEasyCases} />
                </Box>
                {/* <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                    
                </Box> */}
            </Box>
        </Box>
    )
}

export default DecisionPanel;