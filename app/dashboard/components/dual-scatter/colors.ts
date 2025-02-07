// utils/colors.ts
import { scaleOrdinal } from 'd3';

export const getClusterColors = (clusters: string[]) => {
    return scaleOrdinal<string, string>()
        .domain(clusters)
        .range([
            '#1976d2', // blue
            '#2e7d32', // green
            '#d32f2f', // red
            '#ed6c02', // orange
            '#9c27b0', // purple
            '#0288d1', // light blue
            '#388e3c', // light green
            '#f44336', // light red
            '#ff9800', // light orange
            '#7b1fa2'  // light purple
        ]);
};