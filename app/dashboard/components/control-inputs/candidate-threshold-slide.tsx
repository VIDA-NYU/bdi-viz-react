'use client';

import { useState } from 'react';
import { Box, FormControl, Typography, MenuItem, Slider } from '@mui/material';

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
            <Typography
                id="candidate-threshold-select-label"
                sx={{ color: "#000" }}
                gutterBottom
            >
                Candidate Threshold
            </Typography>
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