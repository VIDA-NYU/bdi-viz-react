'use client';

import { useState, useEffect } from 'react';
import { Box, FormControl, Stack, Slider, Typography } from '@mui/material';

interface Matcher {
    name: string;
    weight: number;
}

interface MatcherSelectionProps {
    matchers: Matcher[];
    onSlide: (matchers: Matcher[]) => void;
}

const MatcherSliders: React.FC<MatcherSelectionProps> = ({ matchers, onSlide }) => {
    console.log(matchers);
    const [sliderValues, setSliderValues] = useState<number[]>(matchers.map(matcher => matcher.weight));

    useEffect(() => {
        setSliderValues(matchers.map(matcher => matcher.weight));
    }, [matchers]);

    const handleSliderChange = (index: number, value: number | number[]) => {
        const newValues = [...sliderValues];
        newValues[index] = value as number;
        setSliderValues(newValues);
        console.log(`Matcher: ${matchers[index].name}, New Weight: ${value}`);
        const newMatchers = matchers.map((matcher, i) => {
            return {
                name: matcher.name,
                weight: newValues[i]
            };
        });
        onSlide(newMatchers);
    };

    return (
        <FormControl fullWidth>
            <Typography 
                id="matcher-sliders-label"
                sx={{ color: "#000", mb: 2 }}
                gutterBottom
            >
                Matcher Weights
            </Typography>
            
                {matchers.map((matcher, index) => (
                    <Box key={index}>
                        <Typography
                            sx={{ color: "#000", fontSize: 12, flexGrow: 1 }}
                        >
                            {matcher.name}
                        </Typography>
                        <Stack sx={{ width: '100%' }} spacing={2} direction="row">
                            <Slider
                                orientation="horizontal"
                                size="small"
                                aria-label={matcher.name}
                                defaultValue={matcher.weight}
                                // marks={marks}
                                valueLabelDisplay="auto"
                                step={0.01}
                                min={0}
                                max={1}
                                value={sliderValues[index]}
                                onChange={(event, value) => handleSliderChange(index, value)}
                                sx={{ flexGrow: 2 }}
                            />
                            <Typography
                                sx={{ color: "#000", fontSize: 12, ml: 2 }}
                            >
                                {sliderValues[index]?.toFixed(2) ?? 0}
                            </Typography>
                        </Stack>
                    </Box>
                ))}
            
        </FormControl>
    );
}

export default MatcherSliders;
