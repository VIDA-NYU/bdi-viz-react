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
        <Box sx={{ width: "100%", flexGrow: 1 }}>
            <FormControl fullWidth>
            <SectionLabel id="candidate-threshold-select-label" sx={{ marginBottom: 0.5 }}>
                Candidate Threshold
            </SectionLabel>
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
                        { value: 0.2, label: '0.2' },
                        { value: 0.4, label: '0.4' },
                        { value: 0.6, label: '0.6' },
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
            </FormControl>
        </Box>
    )
}

export default CandidateThresholdSlide;