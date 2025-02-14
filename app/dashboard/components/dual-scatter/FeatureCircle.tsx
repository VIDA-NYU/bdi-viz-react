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
    degree: number;
    size: number;
    selected?: boolean;
    maxDegree?: number;
}

export const FeatureCircle: React.FC<FeatureCircleProps> = ({
    degree,
    size,
    selected,
    maxDegree = 10  // Default max degree for scaling
}) => {
    const radius = size / 2;
    const dotRadius = size * 0.08;  // Size of each dot
    const normalizedDegree = Math.min(Math.ceil((degree / maxDegree) * 8), 8);  // Max 8 dots
    
    // Generate positions for dots around the circle
    const getDotPositions = () => {
        const positions = [];
        for (let i = 0; i < normalizedDegree; i++) {
            const angle = (i / 8) * 2 * Math.PI - Math.PI / 2; // Start from top
            positions.push({
                x: Math.cos(angle) * (radius * 0.7),  // 0.7 to place dots inside the circle
                y: Math.sin(angle) * (radius * 0.7)
            });
        }
        return positions;
    };

    return (
        <g>
            {/* Main circle */}
            <circle
                r={radius}
                fill="white"
                stroke={selected ? '#1976d2' : '#ccc'}
                strokeWidth={selected ? 2 : 1}
            />
            
            {/* Degree dots */}
            {getDotPositions().map((pos, i) => (
                <circle
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    r={dotRadius}
                    fill={selected ? '#1976d2' : '#666'}
                    opacity={0.8}
                >
                    <title>Degree: {degree}</title>
                </circle>
            ))}
        </g>
    );
};