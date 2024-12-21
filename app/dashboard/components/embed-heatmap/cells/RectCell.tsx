// components/cells/RectCell.tsx
import React from 'react';
import { CellProps } from './types';

const RectCell: React.FC<CellProps> = ({
    data,
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
    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color(data.score)}
            stroke="black"
            strokeWidth={isSelected ? 2 : 0}
            onMouseEnter={(e) => onHover?.(e, data)}
            onMouseLeave={onLeave}
            onClick={() => onClick?.(data)}
        />
    );
};

export { RectCell };
