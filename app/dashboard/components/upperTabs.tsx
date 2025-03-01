"use client";

import { useState } from "react";
import { Box, Tab } from "@mui/material";
import { TabPanel, TabList, TabContext } from "@mui/lab";

import HeatMap from "./embed-heatmap/HeatMap";

interface UpperTabsProps {
  weightedAggregatedCandidates: AggregatedCandidate[];
  sourceCluster: string[];
  targetOntologies: TargetOntology[];
  selectedCandidate: Candidate | undefined;
  setSelectedCandidate: (candidate: Candidate | undefined) => void;
  sourceUniqueValues: SourceUniqueValues[];
  targetUniqueValues: TargetUniqueValues[];
  highlightSourceColumns: Array<string>;
  highlightTargetColumns: Array<string>;
}

const UpperTabs: React.FC<UpperTabsProps> = ({
  weightedAggregatedCandidates,
  sourceCluster,
  targetOntologies,
  selectedCandidate,
  setSelectedCandidate,
  sourceUniqueValues,
  targetUniqueValues,
  highlightSourceColumns,
  highlightTargetColumns,
}) => {
  const [value, setValue] = useState(1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "500px",
        marginTop: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TabContext value={value}>
        <Box sx={{ borderTop: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Clustered Heat Map" value={1} />
            {/* <Tab label="" value={2} /> */}
          </TabList>
        </Box>
        <TabPanel
          sx={{
            paddingTop: 0,
            flexGrow: 1,
            flexDirection: "column",
            display: "flex",
          }}
          value={1}
        >
          <HeatMap
            data={weightedAggregatedCandidates}
            sourceCluster={sourceCluster}
            targetOntologies={targetOntologies}
            selectedCandidate={selectedCandidate}
            setSelectedCandidate={setSelectedCandidate}
            sourceUniqueValues={sourceUniqueValues}
            targetUniqueValues={targetUniqueValues}
            sx={{
              // flexBasis: "200px",
              flexGrow: 1,
            }}
            highlightSourceColumns={highlightSourceColumns}
            highlightTargetColumns={highlightTargetColumns}
          />
        </TabPanel>
        <TabPanel sx={{ padding: 0 }} value={2}>
          Temp
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default UpperTabs;
