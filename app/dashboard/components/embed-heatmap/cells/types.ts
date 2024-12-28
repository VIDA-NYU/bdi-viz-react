// components/cells/types.ts
import { ScaleSequential } from 'd3';
import { HeatMapConfig } from '../types';

interface CellData {
    sourceColumn: string;
    targetColumn: string;
    score: number;
}

interface CellProps {
    config: HeatMapConfig;
    data: CellData;
    x: number;
    y: number;
    width: number;
    height: number;
    color: ScaleSequential<string, string>;
    isSelected: boolean;
    onHover?: (event: React.MouseEvent, data: CellData) => void;
    onLeave?: () => void;
    onClick?: (data: CellData) => void;

}

export type {
    CellData,
    CellProps
}