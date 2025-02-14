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
    onClick,
    isHighlighted
}) => {
    return (
        <rect
            className='heatmap-cell'
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color(data.score)}
            stroke="black"
            strokeWidth={isSelected || isHighlighted ? 2 : 0}
            onMouseEnter={(e) => onHover?.(e, data)}
            onMouseLeave={onLeave}
            onClick={() => onClick?.(data)}
            rx={3}
            ry={3}
            // cornerRadius={5}
        />
    );
};

export { RectCell };
