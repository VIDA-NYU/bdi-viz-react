// components/CellsLayer.tsx
import React from 'react';
import { RectCell } from './cells/RectCell';
import { BarCell } from './cells/BarCell';
import { ExpandedCell } from './cells/ExpandedCell';
import { CellData } from './cells/types';
import { HeatMapConfig } from './types';

interface CellsLayerProps {
    data: CellData[];
    x: (value: string) => number;
    y: (value: string) => number;
    cellWidth: (value: string) => number;
    cellHeight: (value: string) => number;
    color: (value: number) => string;
    config: HeatMapConfig;
    expandedCell: CellData | null;
    filters?: {
        selectedCandidate?: CellData;
    };
    onCellClick: (cell: CellData) => void;
    onHover: (event: any) => void;
    onLeave: () => void;
}

export const CellsLayer: React.FC<CellsLayerProps> = ({
    data,
    x,
    y,
    cellWidth,
    cellHeight,
    color,
    config,
    expandedCell,
    filters,
    onCellClick,
    onHover,
    onLeave
}) => {
    const CellComponent = config.cellType === 'rect' ? RectCell : BarCell;

    return (
        <>
            {/* Regular cells */}
            {data.map((d: CellData) => {
                const isExpanded = expandedCell?.sourceColumn === d.sourceColumn && 
                                 expandedCell?.targetColumn === d.targetColumn;
                return (
                    <CellComponent
                        key={`${d.sourceColumn}-${d.targetColumn}`}
                        data={d}
                        config={config}
                        x={x(d.targetColumn)}
                        y={y(d.sourceColumn)}
                        width={cellWidth(d.targetColumn)}
                        height={cellHeight(d.sourceColumn)}
                        color={color(d.score)}
                        isSelected={filters?.selectedCandidate?.sourceColumn === d.sourceColumn &&
                                  filters?.selectedCandidate?.targetColumn === d.targetColumn}
                        isExpanded={isExpanded}
                        onHover={onHover}
                        onLeave={onLeave}
                        onClick={() => onCellClick(d)}
                    />
                );
            })}

            {/* Expanded cell */}
            {expandedCell && (
                <ExpandedCell
                    sourceColumn={expandedCell.sourceColumn}
                    targetColumn={expandedCell.targetColumn}
                    score={expandedCell.score}
                    x={x(expandedCell.targetColumn)}
                    y={y(expandedCell.sourceColumn)}
                    onClose={() => onCellClick(expandedCell)}
                />
            )}
        </>
    );
};