'use client';

import { useState } from 'react';
import { Box, FormControl, Typography, Slider } from '@mui/material';

interface SimilarSourcesSlideProps {
    onSelect: (num: number) => void;
}

const SimilarSourcesSlide: React.FC<SimilarSourcesSlideProps> = ({ onSelect }) => {
    const [similarSources, setSimilarSources] = useState<number>(5);

    const handleChange = (num: number) => {
        setSimilarSources(num);
        onSelect(num);
    }

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl fullWidth>
            <Typography
                id="similar-sources-select-label"
                sx={{ color: "#000" }}
                gutterBottom
            >
                Similar Sources
            </Typography>
                <Slider
                    value={similarSources}
                    onChange={(e, num) => handleChange(num as number)}
                    aria-labelledby="similar-sources-select-label"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={5}
                />
            </FormControl>
        </Box>
    )
}

export default SimilarSourcesSlide;