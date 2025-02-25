'use client';

import { useState } from "react";
// import StackedHeatMap from "./embed-heatmap/stackedHeatMap";
import HeatMap from "./embed-heatmap/HeatMap";


import { Box, Tab } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';
import HierarchicalAxis from "./embed-heatmap/HierarchicalAxis";

interface lowerTabsProps {
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

const LowerTabs: React.FC<lowerTabsProps> = ({
    weightedAggregatedCandidates,
    sourceCluster,
    targetOntologies,
    selectedCandidate,
    setSelectedCandidate,
    sourceUniqueValues,
    targetUniqueValues,
    highlightSourceColumns,
    highlightTargetColumns
}) => {
    const [value, setValue] = useState(1);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', minHeight: "500px", marginTop: 0, display: "flex", flexDirection: "column" }}>
          <TabContext value={value}>
          <TabPanel sx={{ padding: 0, flexBasis: "400px", flexGrow: 1, 
            flexDirection: 'column',
            display: 'flex',

            }} value={1}>
                <HeatMap
                    data={weightedAggregatedCandidates}
                    sourceCluster={sourceCluster}
                    selectedCandidate={selectedCandidate}
                    setSelectedCandidate={setSelectedCandidate}
                    sourceUniqueValues={sourceUniqueValues}
                    targetUniqueValues={targetUniqueValues}
                    sx={{
                      flexBasis: "200px",
                      flexGrow: 1,
                    }}
                    highlightSourceColumns={highlightSourceColumns}
                    highlightTargetColumns={highlightTargetColumns}
                />
                <HierarchicalAxis
                    data={weightedAggregatedCandidates}
                    sourceCluster={sourceCluster}
                    targetOntologies={targetOntologies}
                    selectedCandidate={selectedCandidate}
                    sx={{
                      flexBasis: "160px",
                      flexGrow: 1,
                    }}
                />
          </TabPanel>
          <TabPanel sx={{ padding: 0 }} value={2}>
                Temp
          </TabPanel>
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Clustered Heat Map" value={1} />
                {/* <Tab label="" value={2} /> */}
              </TabList>
            </Box>
          </TabContext>
        </Box>
    );
}

export default LowerTabs;