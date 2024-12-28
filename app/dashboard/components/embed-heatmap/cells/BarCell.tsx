// components/cells/BarCell.tsx
import React from 'react';
import { CellProps } from './types';

const BarCell: React.FC<CellProps> = ({
    data,
    config,
    x,
    y,
    width,
    height,
    color,
    isSelected,
    onHover,
    onLeave,
    onClick
}) => {
    // console.log('data', data);
    const barHeight = height * (data.score - config.minScore ) / (config.maxScore - config.minScore);
    // console.log('barHeight', barHeight);
    const barY = y + (height - barHeight);

    return (
        <g
            onMouseEnter={(e) => onHover?.(e, data)}
            onMouseLeave={onLeave}
            onClick={() => onClick?.(data)}
        >
            {/* Background */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="white"
                stroke="black"
                strokeWidth={isSelected ? 2 : 0}
            />
            {/* Score bar */}
            <rect
                x={x}
                y={barY}
                width={width}
                height={barHeight}
                fill={color(data.score)}
            />
        </g>
    );
};

export { BarCell };