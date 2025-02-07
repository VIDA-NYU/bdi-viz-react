// components/SchemaViz/FeatureCircle.tsx
import React from 'react';
import { arc } from 'd3';

interface FeatureCircleProps {
    features: {
        speed: number;
        volume: number;
        reach: number;
        quality: number;
    };
    size: number;
    selected?: boolean;
}

export const FeatureCircle: React.FC<FeatureCircleProps> = ({
    features,
    size,
    selected
}) => {
    const radius = size / 2;
    
    // Create arcs for each feature
    const createArc = (startAngle: number, value: number) => {
        return arc()({
            innerRadius: radius * 0.6,
            outerRadius: radius * 0.8,
            startAngle,
            endAngle: startAngle + (Math.PI / 2) * value
        }) || undefined;
    };

    return (
        <g>
            <circle
                r={radius}
                fill="white"
                stroke={selected ? '#1976d2' : '#ccc'}
                strokeWidth={selected ? 2 : 1}
            />
            <path d={createArc(0, features.speed)} fill="#ff7043" />
            <path d={createArc(Math.PI/2, features.volume)} fill="#66bb6a" />
            <path d={createArc(Math.PI, features.reach)} fill="#42a5f5" />
            <path d={createArc(Math.PI*3/2, features.quality)} fill="#ab47bc" />
        </g>
    );
};

