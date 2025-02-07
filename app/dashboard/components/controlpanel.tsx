"use client";

import { useState } from "react";
import { alpha, styled } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
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
import MatcherSelection from "./control-inputs/matcher-selection";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: "8px 12px",
  minHeight: "auto",
  width: "100%"
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
  onMatcherSelect: (matcher: Matcher) => void;

  state: {
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
    selectedMatcher: Matcher;
  };
}

const drawerWidth = 240;

const ControlPanel: React.FC<ToolbarProps> = ({ 
  isFloating = false, 
  width,
  containerStyle = {},
  ...props 
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, color: "#000" }}>
        BDI Viz
      </Typography>
      <Divider />
      <List>
        <ListItem key="source-column">
          <SourceColumnSelection
            sourceColumns={props.sourceColumns}
            selectedSourceColumn={props.state.sourceColumn}
            onSelect={props.onSourceColumnSelect}
          />
        </ListItem>
        <ListItem key="candidate-type">
          <CandidateTypeSelection onSelect={props.onCandidateTypeSelect} />
        </ListItem>
        <ListItem key="similar-sources">
          <SimilarSourcesSlide onSelect={props.onSimilarSourcesSelect} />
        </ListItem>
        <ListItem key="candidate-threshold">
          <CandidateThresholdSlide onSelect={props.onCandidateThresholdSelect} />
        </ListItem>
      </List>
    </Box>
  );

  // Styles for the AppBar when it's floating vs static
  const appBarStyles = isFloating ? {
    position: "fixed" as const,
    boxShadow: 0,
    bgcolor: "transparent",
    backgroundImage: "none",
    mt: "calc(var(--template-frame-height, 0px) + 28px)",
    top: 0,
    width: width,
    minWidth: "min-content",
  } : {
    position: "static" as const,
    bgcolor: "transparent",
    backgroundImage: "none",
    width: "100%",
    minWidth: "min-content",
  };

  // Root container styles
  const rootStyles = {
    display: "flex",
    flexDirection: "column" as const,
    width: width || "100%",
    minWidth: "min-content",
    flex: width ? "0 0 auto" : "1 1 auto",
    ...containerStyle
  };

  return (
    <Box sx={rootStyles}>
      <AppBar
        enableColorOnDark
        sx={appBarStyles}
        component="div"
      >
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
              onClick={handleDrawerToggle}
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
              BDI Viz
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
              </Box>
              <Box sx={{ display: "flex", gap: 1, minWidth: "min-content", alignContent: "flex-start", justifyContent: "flex-start" }}>
                <DiscardColumnButton onClick={props.discardColumn} />
                <UndoButton onClick={props.undo} />
                <RedoButton onClick={props.redo} />
              </Box>
              <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
              <MatcherSelection 
                  matchers={props.matchers} 
                  selectedMatcher={props.state.selectedMatcher} 
                  onSelect={props.onMatcherSelect} 
                />
                
              </Box>
            </Box>
          </Box>
        </StyledToolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default ControlPanel;