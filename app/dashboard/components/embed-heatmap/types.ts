import { RectCell } from './cells/RectCell';
import { BarCell } from './cells/BarCell';
import { CellData } from './cells/types';

type CellType = 'rect' | 'bar';
type ColorScheme = 'blues' | 'viridis' | 'rdbu';


interface HeatMapConfig {
    cellType: CellType;
    colorScheme: ColorScheme;
    colorScalePadding: number;  // Percentage padding for color scale
    minScore: number;  // Optional manual override for min score
    maxScore: number;  // Optional manual override for max score
}

export type {
    HeatMapConfig, 
    CellType,
    
}