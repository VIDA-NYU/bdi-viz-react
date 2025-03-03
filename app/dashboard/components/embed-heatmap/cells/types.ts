// components/cells/types.ts
import { ScaleSequential } from 'd3';
import { HeatMapConfig } from '../types';

interface CellProps {
    config: HeatMapConfig;
    data: AggregatedCandidate;
    x: number;
    y: number;
    width: number;
    height: number;
    color: ScaleSequential<string, string>;
    isSelected?: boolean;
    onHover?: (event: React.MouseEvent, data: any) => void;
    onLeave?: () => void;
    onClick?: (data: AggregatedCandidate) => void;
    isHighlighted?: boolean;
}

export type {
    CellProps
}