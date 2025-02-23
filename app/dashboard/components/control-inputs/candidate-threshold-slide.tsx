'use client';

import { useState } from 'react';
import { Box, FormControl, Typography, Slider } from '@mui/material';
import { SectionLabel } from '../../layout/components';

interface CandidateThresholdSlideProps {
    onSelect: (num: number) => void;
}

const CandidateThresholdSlide: React.FC<CandidateThresholdSlideProps> = ({ onSelect }) => {
    const [candidateThreshold, setCandidateThreshold] = useState<number>(0.5);

    const handleChange = (num: number) => {
        setCandidateThreshold(num);
        onSelect(num);
    }

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl fullWidth>
            <SectionLabel id="candidate-threshold-select-label">
                Candidate Threshold
            </SectionLabel>
                <Slider
                    value={candidateThreshold}
                    onChange={(e, num) => handleChange(num as number)}
                    aria-labelledby="candidate-threshold-select-label"
                    valueLabelDisplay="auto"
                    step={0.1}
                    marks
                    min={0}
                    max={0.8}
                />
            </FormControl>
        </Box>
    )
}

export default CandidateThresholdSlide;