// components/SchemaViz/ClusterSelector.tsx
import React, { useState } from 'react';
import { 
    Box, 
    Checkbox, 
    FormControlLabel, 
    IconButton, 
    Paper,
    Slider,
    Typography,
    Divider,
    Stack 
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface ClusterSelectorProps {
    clusters: string[];
    selectedClusters: string[];
    onClusterToggle: (cluster: string) => void;
    threshold?: number;
    onThresholdChange?: (event: Event, value: number | number[]) => void;
    scoreRange?: {
        min: number;
        max: number;
    };
}

export const ClusterSelector: React.FC<ClusterSelectorProps> = ({
    clusters,
    selectedClusters,
    onClusterToggle,
    threshold = 0,
    onThresholdChange,
    scoreRange = { min: 0, max: 1 }
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                        onClick={() => setExpanded(!expanded)}
                        sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {expanded ? (
                            clusters.map(cluster => (
                                <FormControlLabel
                                    key={cluster}
                                    control={
                                        <Checkbox
                                            checked={selectedClusters.includes(cluster)}
                                            onChange={() => onClusterToggle(cluster)}
                                            size="small"
                                        />
                                    }
                                    label={cluster}
                                    sx={{ m: 0 }}
                                />
                            ))
                        ) : (
                            <Box sx={{ typography: 'body2' }}>
                                {selectedClusters.length} / {clusters.length} clusters selected
                            </Box>
                        )}
                    </Box>
                </Box>

                <Divider />

                <Box sx={{ px: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="textSecondary">
                        Score Threshold
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Slider
                                value={threshold}
                                onChange={onThresholdChange}
                                min={scoreRange.min}
                                max={scoreRange.max}
                                step={0.01}
                                marks={[
                                    { value: scoreRange.min, label: scoreRange.min.toFixed(2) },
                                    { value: scoreRange.max, label: scoreRange.max.toFixed(2) }
                                ]}
                                sx={{
                                    '& .MuiSlider-thumb': {
                                        width: 12,
                                        height: 12,
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow: 'none'
                                        }
                                    },
                                    '& .MuiSlider-track': {
                                        height: 4
                                    },
                                    '& .MuiSlider-rail': {
                                        height: 4,
                                        opacity: 0.5
                                    }
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ 
                            minWidth: 45,
                            textAlign: 'right',
                            color: 'text.secondary'
                        }}>
                            {threshold.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </Paper>
    );
};