"use client";

import { useState } from "react";
// import * as d3 from 'd3';
import { alpha, styled } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Container,
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


const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: "8px 12px",
}));

interface ToolbarProps {
  sourceColumns: string[];
  onSourceColumnSelect: (column: string) => void;

  onCandidateTypeSelect: (dataType: string) => void;

  onSimilarSourcesSelect: (num: number) => void;

  onCandidateThresholdSelect: (num: number) => void;

  acceptMatch: () => void;
  rejectMatch: () => void;
  discardColumn: () => void;
  undo: () => void;
  redo: () => void;
}

const drawerWidth = 240;

const ControlPanel: React.FC<ToolbarProps> = (prop) => {
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
            sourceColumns={prop.sourceColumns}
            onSelect={prop.onSourceColumnSelect}
          />
        </ListItem>
        <ListItem key="candidate-type">
          <CandidateTypeSelection onSelect={prop.onCandidateTypeSelect} />
        </ListItem>
        <ListItem key="similar-sources">
          <SimilarSourcesSlide onSelect={prop.onSimilarSourcesSelect} />
        </ListItem>
        <ListItem key="candidate-threshold">
            <CandidateThresholdSlide onSelect={prop.onCandidateThresholdSelect} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        enableColorOnDark
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: "calc(var(--template-frame-height, 0px) + 28px)",
        }}
        component="nav"
      >
        <Container maxWidth="lg">
          <StyledToolbar variant="dense" disableGutters>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ m: 2, display: { xs: "flex", sm: "none" } }}
              >
                <MenuIcon style={{ color: "#000" }} />
              </IconButton>
              <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, color: "#000" }}
                >
                BDI Viz
              </Typography>
              <Box m={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Box sx={{ mr: 2 }}>
                    <SourceColumnSelection
                    sourceColumns={prop.sourceColumns}
                    onSelect={prop.onSourceColumnSelect}
                    />
                </Box>
                <Box sx={{ mr: 2 }}>
                    <CandidateTypeSelection onSelect={prop.onCandidateTypeSelect} />
                </Box>
                <Box sx={{ mr: 2 }}>
                    <SimilarSourcesSlide onSelect={prop.onSimilarSourcesSelect} />
                </Box>
                <Box sx={{ mr: 2 }}>
                    <CandidateThresholdSlide onSelect={prop.onCandidateThresholdSelect} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2 }}>
                    <Box sx={{ mb: 1 }}>
                        <AcceptMatchButton onClick={prop.acceptMatch} />
                    </Box>
                    <Box>
                        <RejectMatchButton onClick={prop.rejectMatch} />
                    </Box>
                </Box>
                <Box sx={{ mr: 2 }}>
                    <DiscardColumnButton onClick={prop.discardColumn} />
                </Box>
              </Box>
            </Toolbar>
          </StyledToolbar>
        </Container>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
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
      </nav>
    </Box>
  );
};

export default ControlPanel;
