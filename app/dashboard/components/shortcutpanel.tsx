"use client";

import { useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
} from "@mui/material";
import FileUploading from "./fileuploading";
import { SectionHeader } from "../layout/components";


interface ShortcutPanelProps {
    handleFileUpload: (newCandidates: Candidate[], newSourceClusters?: SourceCluster[], newMatchers?: Matcher[]) => void;
}

const ShortcutPanel: React.FC<ShortcutPanelProps> = ({
    handleFileUpload,
}) => {
  return (
    <>
        <SectionHeader>
            Shortcut Panel
        </SectionHeader>
        <Box sx={{ width: '100%', alignItems: "left" }}>
        <FileUploading callback={handleFileUpload}/>
        </Box>
    </>
  );
}

export default ShortcutPanel;
