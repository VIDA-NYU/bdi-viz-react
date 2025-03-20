'use client';
import { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, Slider, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { SectionLabel } from '../../layout/components';
import { getColorScale } from '../embed-heatmap/utils/color';


interface SourceColumn {
  maxScore: number;
  // other properties as needed
}

interface CandidateThresholdSlideProps {
  sourceColumns: SourceColumn[];
  selectedCandidateThreshold: number;
  onSelect: (num: number) => void;
}

const CandidateThresholdSlide: React.FC<CandidateThresholdSlideProps> = ({
  sourceColumns,
  selectedCandidateThreshold,
  onSelect
}) => {
  const [candidateThreshold, setCandidateThreshold] = useState<number>(0.7);
  const [histogramVisible, setHistogramVisible] = useState<boolean>(false);

  // Generate histogram data from sourceColumns
  const histogramData = useMemo(() => {
    if (!sourceColumns || sourceColumns.length === 0) return [];

    // Extract maxScore values
    const scores = sourceColumns.map(col => col.maxScore);
    
    // Define bin ranges (from 0 to 0.8 with 0.1 steps)
    const bins = Array.from({ length: 9 }, (_, i) => i * 0.1);
    
    // Count values in each bin
    const histData = bins.map(binStart => {
      const binEnd = binStart + 0.1;
      const count = scores.filter(score => score >= binStart && score < binEnd).length;
      return {
        bin: binStart,
        count
      };
    });

    return histData;
  }, [sourceColumns]);

  // Color scale for the histogram
  const colorScale = useMemo(() => {
    return getColorScale('blues', 0, 0.8);
  }, []);

  const handleChange = (num: number) => {
    setCandidateThreshold(num);
    onSelect(num);
  };

  useEffect(() => {
    if (selectedCandidateThreshold !== undefined) {
      setCandidateThreshold(selectedCandidateThreshold);
    }
  }, [selectedCandidateThreshold]);

  // Find the maximum count for scaling
  const maxCount = Math.max(...histogramData.map(d => d.count || 1));

  return (
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      <FormControl fullWidth>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <SectionLabel id="candidate-threshold-select-label">
            Candidate Threshold
          </SectionLabel>
          <IconButton 
            size="small" 
            onClick={() => setHistogramVisible(!histogramVisible)}
            sx={{ p: 0.5 }}
            aria-label={histogramVisible ? "Hide histogram" : "Show histogram"}
          >
            {histogramVisible ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        {/* Slider component */}
        <Box sx={{ 
          position: 'relative', 
          height: 40, 
          mt: 1, 
          mb: 2
        }}>
          <Slider
            value={candidateThreshold}
            onChange={(e, num) => handleChange(num as number)}
            aria-labelledby="candidate-threshold-select-label"
            valueLabelDisplay="auto"
            step={0.1}
            marks={[
              { value: 0.1, label: '0.1' },
              { value: 0.3, label: '0.3' },
              { value: 0.5, label: '0.5' },
              { value: 0.7, label: '0.7' },
            ]}
            sx={{
              padding: 0,
              margin: 0,
              '& .MuiSlider-mark': {
                height: 2,
                width: 2,
              },
              '& .MuiSlider-markLabel': {
                top: 5,
                fontSize: '0.75rem',
              }
            }}
            min={0}
            max={0.8}
          />
        </Box>
      </FormControl>
      
      {/* Histogram - only shown when expanded */}
      {histogramVisible && (
        <Box 
          sx={{ 
            width: '100%',
            height: 150,
            mt: 2,
            position: 'relative',
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 2
          }}
        >
          {/* Histogram bars */}
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              mx: 2
            }}
          >
            {histogramData.map((bin, index) => (
              <Box
                key={index}
                sx={{
                  width: `${100 / histogramData.length}%`,
                  height: `${Math.max(bin.count * 100 / maxCount, 2)}%`,
                  backgroundColor: colorScale(bin.bin),
                  opacity: candidateThreshold >= bin.bin ? 1 : 0.5,
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  pb: 0.5
                }}
              >
                {/* Only show count for bars with significant values */}
                {bin.count > 0 && bin.count / maxCount > 0.15 && (
                  <Box 
                    sx={{ 
                      fontSize: '0.7rem', 
                      color: 'white',
                      textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {bin.count}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          
          {/* X-axis labels */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -25,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              px: 2
            }}
          >
            {histogramData.map((bin, index) => (
              <Box
                key={index}
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  width: `${100 / histogramData.length}%`,
                  textAlign: 'center'
                }}
              >
                {bin.bin.toFixed(1)}
              </Box>
            ))}
          </Box>
          
          {/* Threshold indicator line */}
          <Box 
            sx={{
              position: 'absolute',
              left: `calc(${(candidateThreshold / 0.8) * 100}% + ${2 / histogramData.length}%)`,
              top: 0,
              height: '100%',
              width: 2,
              backgroundColor: 'error.main',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: -5,
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '8px solid',
                borderTopColor: 'error.main'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CandidateThresholdSlide;