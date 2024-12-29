// components/HeatMapControls.tsx
import React from 'react';
import { 
    Card, 
    CardContent, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Slider, 
    Typography,
    Stack
} from '@mui/material';

import { HeatMapConfig } from './types';


interface HeatMapControlsProps {
    config: HeatMapConfig;
    onConfigChange: React.Dispatch<React.SetStateAction<HeatMapConfig>>;
    dataRange: { min: number; max: number };
}

const HeatMapControls: React.FC<HeatMapControlsProps> = ({ 
    config, 
    onConfigChange,
    dataRange 
}) => {
    const handleChange = (field: keyof HeatMapConfig, value: any) => {
        onConfigChange(prev => {return {
            ...config,
            [field]: value
        }});
    };
    
    return (
        <Card>
            <CardContent>
                <Stack spacing={3}>
                    <FormControl fullWidth>
                        <InputLabel>Cell Type</InputLabel>
                        <Select
                            value={config.cellType}
                            onChange={(e) => handleChange('cellType', e.target.value)}
                        >
                            <MenuItem value="rect">Heat Map</MenuItem>
                            <MenuItem value="bar">Bar Chart</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Color Scheme</InputLabel>
                        <Select
                            value={config.colorScheme}
                            onChange={(e) => handleChange('colorScheme', e.target.value)}
                        >
                            <MenuItem value="blues">Blues</MenuItem>
                            <MenuItem value="viridis">Viridis</MenuItem>
                            <MenuItem value="rdbu">Red-Blue</MenuItem>
                        </Select>
                    </FormControl>

                    <div>
                        <Typography gutterBottom>
                            Color Scale Padding (%)
                        </Typography>
                        <Slider
                            value={config.colorScalePadding}
                            onChange={(_, value) => handleChange('colorScalePadding', value)}
                            min={0}
                            max={20}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </div>

                    <div>
                        <Typography gutterBottom>
                            Score Range
                        </Typography>
                        <Slider
                            value={[
                                config.minScore ?? dataRange.min,
                                config.maxScore ?? dataRange.max
                            ]}
                            onChange={(_, value) => {
                                const [min, max] = value as number[];
                                // console.log('v', value, min, max, dataRange);
                                
                                onConfigChange(
                                    prev => {
                                        return {
                                            ...prev,
                                            minScore: min < dataRange.min ? min : dataRange.min,
                                            maxScore: max > dataRange.max ? max : dataRange.max
                                        }
                                    }
                                )
                                // handleChange('minScore', min);
                                // handleChange('maxScore', max);
                            }}
                            min={0}
                            max={1}
                            step={0.01}
                            valueLabelDisplay="auto"
                        />
                    </div>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default HeatMapControls;