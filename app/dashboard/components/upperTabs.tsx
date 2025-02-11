'use client';

import { useState } from "react";
import UpsetPlot from "./upset-plot/UpsetPlot";
import ValueComparisonTable from "./value-comparisons/value-comparison-table";

import { Box, Tab, Paper } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';

interface UpperTabsProps {
  filteredCandidates: Candidate[];
  matchers: Matcher[];
  selectedCandidate?: Candidate;
  selectedSourceColumn: string;
  valueMatches: ValueMatch[];
}

const UpperTabs: React.FC<UpperTabsProps> = ({
  filteredCandidates,
  matchers,
  selectedCandidate,
  selectedSourceColumn,
  valueMatches,
}) => {
  const [value, setValue] = useState(1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', marginTop: 0 }}>
      <TabContext value={value}>
          <TabList onChange={handleChange} aria-label="basic tabs example">
            <Tab label="UpSet Plot" value={1} />
            <Tab label="Value Comparisons" value={2} />
          </TabList>
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={1}>
            <UpsetPlot
              data={filteredCandidates}
              matchers={matchers}
              selectedCandidate={selectedCandidate ? selectedCandidate : { sourceColumn: selectedSourceColumn, targetColumn: '' } as Candidate}
            />
          </TabPanel>
          <TabPanel sx={{ padding: 0, maxHeight: 400, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} value={2}>
            <ValueComparisonTable
              valueMatches={valueMatches}
              selectedCandidate={selectedCandidate ? selectedCandidate : { sourceColumn: selectedSourceColumn, targetColumn: '' } as Candidate}
            />
          </TabPanel>
      </TabContext>
    </Box>
  );
};

export default UpperTabs;