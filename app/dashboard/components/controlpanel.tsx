"use client";

import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import SourceColumnSelection from "./control-inputs/source-column-selection";
import CandidateTypeSelection from "./control-inputs/candidate-type-selection";
import SimilarSourcesSlide from "./control-inputs/similar-sources-slide";
import CandidateThresholdSlide from "./control-inputs/candidate-threshold-slide";
import AcceptMatchButton from "./control-inputs/accept-match-button";
import RejectMatchButton from "./control-inputs/reject-match-button";
import DiscardColumnButton from "./control-inputs/discard-column-button";
import UndoButton from "./control-inputs/undo-button";
import RedoButton from "./control-inputs/redo-button";
import MatcherSliders from "./control-inputs/matcher-selection";
import FilterEasyCasesButton from "./control-inputs/filter-easy-cases-button";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: "0px",
}));

interface ToolbarProps {
  sourceColumns: string[];
  matchers: Matcher[];
  isFloating?: boolean;
  width?: string | number;
  containerStyle?: React.CSSProperties;

  onSourceColumnSelect: (column: string) => void;
  onCandidateTypeSelect: (dataType: string) => void;
  onSimilarSourcesSelect: (num: number) => void;
  onCandidateThresholdSelect: (num: number) => void;
  acceptMatch: () => void;
  rejectMatch: () => void;
  discardColumn: () => void;
  undo: () => void;
  redo: () => void;
  filterEasyCases: () => void;
  onMatchersSelect: (matchers: Matcher[]) => void;

  state: {
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
  };
}

const ControlPanel: React.FC<ToolbarProps> = ({ 
  isFloating = false, 
  width,
  containerStyle = {},
  ...props 
}) => {

  // Root container styles
  const rootStyles = {
    display: "flex",
    flexDirection: "column" as const,
    flex: width ? "0 0 auto" : "1 1 auto",
    ...containerStyle
  };

  return (
    <Box sx={rootStyles}>
        <StyledToolbar variant="dense">
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
            gap: 2,
            minWidth: "min-content"
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <MenuIcon style={{ color: "#000" }} />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: { xs: "none", sm: "flex" },
                color: "#000",
                whiteSpace: "nowrap"
              }}
            >
              Control Panel
            </Typography>
            <Box sx={{ 
              display: { xs: "none", sm: "flex" },
              flexWrap: "wrap",
              gap: 2,
              flex: "1 1 auto",
              justifyContent: "flex-start",
              alignItems: "center",
              minWidth: "min-content"
            }}>
              <SourceColumnSelection
                sourceColumns={props.sourceColumns}
                selectedSourceColumn={props.state.sourceColumn}
                onSelect={props.onSourceColumnSelect}
              />
              <CandidateTypeSelection
                onSelect={props.onCandidateTypeSelect}
              />
              <SimilarSourcesSlide 
                onSelect={props.onSimilarSourcesSelect} 
              />
              <CandidateThresholdSlide
                onSelect={props.onCandidateThresholdSelect}
              />
              <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                <AcceptMatchButton onClick={props.acceptMatch} />
                <RejectMatchButton onClick={props.rejectMatch} />
                <DiscardColumnButton onClick={props.discardColumn} />
              </Box>
              <Box sx={{ display: "flex", gap: 1, minWidth: "min-content", alignContent: "flex-start", justifyContent: "flex-start" }}>
                <UndoButton onClick={props.undo} />
                <RedoButton onClick={props.redo} />
              </Box>
              <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                <FilterEasyCasesButton onClick={props.filterEasyCases} />
              </Box>
              <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                <MatcherSliders 
                  matchers={props.matchers} 
                  onSlide={props.onMatchersSelect}
                />
              </Box>
            </Box>
          </Box>
        </StyledToolbar>
    </Box>
  );
};

export default ControlPanel;