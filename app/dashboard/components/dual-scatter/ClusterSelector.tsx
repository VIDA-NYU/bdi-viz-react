// components/SchemaViz/ClusterSelector.tsx
import React, { useState } from 'react';
import { Box, Checkbox, FormControlLabel, IconButton, Paper } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface ClusterSelectorProps {
    clusters: string[];
    selectedClusters: string[];
    onClusterToggle: (cluster: string) => void;
}

export const ClusterSelector: React.FC<ClusterSelectorProps> = ({
    clusters,
    selectedClusters,
    onClusterToggle
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Paper sx={{ p: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setExpanded(!expanded)}>
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
        </Paper>
    );
};