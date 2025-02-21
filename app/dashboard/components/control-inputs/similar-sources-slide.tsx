'use client';

import { useState } from 'react';
import { Box, FormControl, Typography, Slider } from '@mui/material';
import { SectionLabel } from '../../layout/components';

interface SimilarSourcesSlideProps {
    onSelect: (num: number) => void;
}

const SimilarSourcesSlide: React.FC<SimilarSourcesSlideProps> = ({ onSelect }) => {
    const [similarSources, setSimilarSources] = useState<number>(2);

    const handleChange = (num: number) => {
        setSimilarSources(num);
        onSelect(num);
    }

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl fullWidth>
            <SectionLabel id="similar-sources-select-label">
                Similar Sources
            </SectionLabel>
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