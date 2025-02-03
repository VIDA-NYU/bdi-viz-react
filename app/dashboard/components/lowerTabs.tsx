'use client';

import { useState } from "react";
// import StackedHeatMap from "./embed-heatmap/stackedHeatMap";
import LayeredHeatMap from "./embed-heatmap/layeredHeatMap";


import { Box, Tab, Tabs, Paper } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';

interface lowerTabsProps {
    candidates: Candidate[];
    sourceCluster: string[];
    selectedCandidate: Candidate | undefined;
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
    selectedMatchers: Matcher[];
    sourceUniqueValues: SourceUniqueValues[];
    targetUniqueValues: TargetUniqueValues[];
}

const LowerTabs: React.FC<lowerTabsProps> = ({
    candidates,
    sourceCluster,
    selectedCandidate,
    setSelectedCandidate,
    selectedMatchers,
    sourceUniqueValues,
    targetUniqueValues
}) => {
    const [value, setValue] = useState(1);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', marginTop: 0 }}>
          <TabContext value={value}>
            <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Layered Heat Map" value={1} />
              <Tab label="Stacked Heat Map" value={2} />
            </TabList>
            </Paper>
          <TabPanel sx={{ padding: 0 }} value={1}>
                <LayeredHeatMap
                    data={candidates}
                    sourceCluster={sourceCluster}
                    selectedCandidate={selectedCandidate}
                    setSelectedCandidate={setSelectedCandidate}
                    selectedMatchers={selectedMatchers}
                    sourceUniqueValues={sourceUniqueValues}
                    targetUniqueValues={targetUniqueValues}
                />
          </TabPanel>
          <TabPanel sx={{ padding: 0 }} value={2}>
                {/* <StackedHeatMap
                    data={candidates}
                    sourceCluster={sourceCluster}
                    selectedCandidate={selectedCandidate}
                    setSelectedCandidate={setSelectedCandidate}
                    selectedMatchers={selectedMatchers}
                /> */}
          </TabPanel>
          </TabContext>
        </Box>
    );
}

export default LowerTabs;