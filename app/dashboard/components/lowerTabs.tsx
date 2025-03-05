'use client';

import { useState } from "react";
import UpsetPlot from "./upset-plot/UpsetPlot";
import ValueComparisonTable from "./value-comparisons/value-comparison-table";

import { Box, Tab, Paper } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';

interface LowerTabsProps {
  weightedAggregatedCandidates: AggregatedCandidate[];
  matchers: Matcher[];
  selectedCandidate?: Candidate;
  selectedSourceColumn: string;
  valueMatches: ValueMatch[];
  handleValueMatches: (valueMatches: ValueMatch[]) => void;
}

const LowerTabs: React.FC<LowerTabsProps> = ({
  weightedAggregatedCandidates,
  matchers,
  selectedCandidate,
  selectedSourceColumn,
  valueMatches,
  handleValueMatches,
}) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', marginTop: 0 }}>
      <TabContext value={value}>
          <TabList onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Hidden" value={0} />
            <Tab label="UpSet Plot" value={1} />
            <Tab label="Value Comparisons" value={2} />
          </TabList>
          <TabPanel sx={{ paddingBottom: 2, maxHeight: 0, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={0}>
          </TabPanel>
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={1}>
            <UpsetPlot
              aggData={weightedAggregatedCandidates}
              matchers={matchers}
              selectedCandidate={selectedCandidate ? selectedCandidate : { sourceColumn: selectedSourceColumn, targetColumn: '' } as Candidate}
            />
          </TabPanel>
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={2}>
            <ValueComparisonTable
              valueMatches={valueMatches}
              targetColumns={weightedAggregatedCandidates.map((agg) => agg.targetColumn)}
              selectedCandidate={selectedCandidate ? selectedCandidate : { sourceColumn: selectedSourceColumn, targetColumn: '' } as Candidate}
              handleValueMatches={handleValueMatches}
            />
          </TabPanel>
      </TabContext>
    </Box>
  );
};

export default LowerTabs;