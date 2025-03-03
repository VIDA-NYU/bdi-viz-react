'use client';

import { useState } from 'react';
import { Box, FormControl, Slider } from '@mui/material';
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
                <SectionLabel id="similar-sources-select-label" sx={{ marginBottom: 0.5 }}>
                    Similar Attributes
                </SectionLabel>
                <Slider
                    value={similarSources}
                    onChange={(e, num) => handleChange(num as number)}
                    aria-labelledby="similar-sources-select-label"
                    valueLabelDisplay="auto"
                    step={1}
                    marks={[
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                        { value: 5, label: '5' }
                    ]}
                    min={1}
                    max={5}
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
                />
            </FormControl>
        </Box>
    )
}

export default SimilarSourcesSlide;