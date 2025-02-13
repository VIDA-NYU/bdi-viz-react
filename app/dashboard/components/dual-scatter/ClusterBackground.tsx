// components/SchemaViz/ClusterBackground.tsx
import React from 'react';
import { computeConvexHull, padHull, getCirclePoints } from './geometry';
import { line, curveBasisClosed } from 'd3';

interface ClusterBackgroundProps {
    nodes: Array<{coordinates: {x: number, y: number}, cluster: string}>;
    cluster: string;
    color: string;
    circleRadius?: number;
}

export const ClusterBackground: React.FC<ClusterBackgroundProps> = ({
    nodes,
    cluster,
    color,
    circleRadius = 25  // slightly larger than the actual circle size
}) => {
    const clusterNodes = nodes.filter(n => n.cluster === cluster);
    
    // Generate points around each circle's perimeter
    const allPoints = clusterNodes.flatMap(node => 
        getCirclePoints(node.coordinates, circleRadius)
    );
    
    if (allPoints.length < 3) return null;

    // Compute and pad the hull
    const hull = computeConvexHull(allPoints);
    const paddedHull = padHull(hull, 0.2);

    // Create a smooth curved line
    const lineGenerator = line<{x: number, y: number}>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveBasisClosed);

    const path = lineGenerator(paddedHull);

    return (
        <path
            d={path || ''}
            fill={color}
            fillOpacity={0.2}
            stroke={color}
            strokeOpacity={0.4}
            strokeWidth={1}
        />
    );
};