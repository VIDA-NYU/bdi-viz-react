'use client';

import { useState } from "react";
import UpsetPlot from "./upset-plot/UpsetPlot";
import CombinedView from "./explanation/CombinedView";

import { Box, Tab, Tabs } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';

interface UpperTabsProps {
    candidates: Candidate[];
    matchers: Matcher[];
    filters: {
        selectedCandidate?: Candidate;
        sourceColumn: string;
        candidateType: string;
        candidateThreshold: number;
    };
    isMatch: boolean;
    currentExplanations: Explanation[];
    selectedExplanations: Explanation[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    matchingValues: string[][];
    relativeKnowledge: RelativeKnowledge[];
    matches: Candidate[];
    isLoading: boolean;
    sourceColumn?: string;
    targetColumn?: string;
    allSourceColumns: string[];
    allTargetColumns: string[];
}

const UpperTabs: React.FC<UpperTabsProps> = ({
    candidates,
    matchers,
    filters,
    isMatch,
    currentExplanations,
    selectedExplanations,
    setSelectExplanations,
    matchingValues,
    relativeKnowledge,
    matches,
    isLoading,
    sourceColumn,
    targetColumn,
    allSourceColumns,
    allTargetColumns
}) => {
    const [value, setValue] = useState(1);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="basic tabs example">
              <Tab label="UpSet Plot" value={1} />
              <Tab label="Explanations" value={2} />
              <Tab label="Temp" value={3} />
            </TabList>
          </Box>
          <TabPanel sx={{ padding: 0 }} value={1}>
                <UpsetPlot
                    data={candidates}
                    matchers={matchers}
                    filters={filters}
                />
          </TabPanel>
          <TabPanel sx={{ padding: 0 }} value={2}>
                <CombinedView
                    isMatch={isMatch}
                    currentExplanations={currentExplanations}
                    selectedExplanations={selectedExplanations}
                    matchingValues={matchingValues}
                    relativeKnowledge={relativeKnowledge}
                    matches={matches}
                    isLoading={isLoading}
                    setSelectExplanations={setSelectExplanations}
                    sourceColumn={sourceColumn}
                    targetColumn={targetColumn}
                    allSourceColumns={allSourceColumns}
                    allTargetColumns={allTargetColumns}
                />
          </TabPanel>
          <TabPanel value={3}>
            Item Three
          </TabPanel>
          </TabContext>
        </Box>
    );
};

export default UpperTabs;