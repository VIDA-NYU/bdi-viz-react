// components/SchemaViz/ClusterBackground.tsx
import React from 'react';
import { computeConvexHull, padHull } from './geometry';

interface ClusterBackgroundProps {
    nodes: Array<{coordinates: {x: number, y: number}, cluster: string}>;
    cluster: string;
    color: string;
}

export const ClusterBackground: React.FC<ClusterBackgroundProps> = ({
    nodes,
    cluster,
    color
}) => {
    const clusterNodes = nodes.filter(n => n.cluster === cluster);
    const points = clusterNodes.map(n => n.coordinates);
    
    if (points.length < 3) return null;

    const hull = computeConvexHull(points);
    const paddedHull = padHull(hull, 0.6); // 20% padding

    // @ts-ignore
    const path = `M ${paddedHull.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

    return (
        <path
            d={path}
            fill={color}
            fillOpacity={0.2}
            stroke={color}
            strokeOpacity={0.4}
            strokeWidth={1}
        />
    );
};