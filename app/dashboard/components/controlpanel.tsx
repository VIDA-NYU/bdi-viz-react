"use client";

import { useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Toolbar,
} from "@mui/material";

import SourceColumnSelection from "./control-inputs/source-column-selection";
import CandidateTypeSelection from "./control-inputs/candidate-type-selection";
import SimilarSourcesSlide from "./control-inputs/similar-sources-slide";
import CandidateThresholdSlide from "./control-inputs/candidate-threshold-slide";
import MatcherSliders from "./control-inputs/matcher-selection";
import LoadingGlobalContext from "@/app/lib/loading/loading-context";
import { SectionHeader } from "@/app/dashboard/layout/components";


interface ControlPanelProps {
  sourceColumns: string[];
  matchers: Matcher[];
  isFloating?: boolean;
  width?: string | number;
  containerStyle?: React.CSSProperties;

  onSourceColumnSelect: (column: string) => void;
  onCandidateTypeSelect: (dataType: string) => void;
  onSimilarSourcesSelect: (num: number) => void;
  onCandidateThresholdSelect: (num: number) => void;
  onMatchersSelect: (matchers: Matcher[]) => void;

  state: {
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
  };
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isFloating = false, 
  width,
  containerStyle = {},
  ...props 
}) => {

  // Loading Global Context
  const { developerMode } = useContext(LoadingGlobalContext);

  // Root container styles
  const rootStyles = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    minWidth: "min-content",
    gap: 2,
    paddingBottom: 2,
    paddingTop: 2,
  };

  return (
    <>
    <SectionHeader>
      Control Panel
    </SectionHeader>
    <Box sx={rootStyles}>
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
              {developerMode && (
                <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
                  <MatcherSliders 
                  matchers={props.matchers} 
                  onSlide={props.onMatchersSelect}
                  />
                </Box>
              )}
      </Box>
    </>
  );
};

export default ControlPanel;