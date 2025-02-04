'use client';

import { useState } from "react";
import UpsetPlot from "./upset-plot/UpsetPlot";
import CombinedView from "./explanation/CombinedView";
import ValueComparisonTable from "./value-comparisons/value-comparison-table";

import { Box, Tab, Tabs, Paper } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';

interface UpperTabsProps {
    filteredCandidates: Candidate[];
    matchers: Matcher[];
    selectedCandidate?: Candidate;
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
    valueMatches: ValueMatch[];
}

const UpperTabs: React.FC<UpperTabsProps> = ({
    filteredCandidates,
    matchers,
    selectedCandidate,
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
    allTargetColumns,
    valueMatches,
}) => {
    const [value, setValue] = useState(1);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', marginTop: 4 }}>
          <TabContext value={value}>
            <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="basic tabs example">
              <Tab label="UpSet Plot" value={1} />
              <Tab label="Explanations" value={2} />
              <Tab label="Value Comparisons" value={3} />
            </TabList>
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={1}>
            <UpsetPlot
                data={filteredCandidates}
                matchers={matchers}
                selectedCandidate={selectedCandidate}
            />
          </TabPanel>
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={2}>
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
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={3}>
            <ValueComparisonTable
                valueMatches={valueMatches}
                selectedCandidate={selectedCandidate}
            />
          </TabPanel>
          </Paper>
          </TabContext>
        </Box>
    );
};

export default UpperTabs;