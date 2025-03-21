import { ExpandedCellType } from './expanded-cells/types';

type CellType = 'rect' | 'bar';
type ColorScheme = 'blues' | 'viridis' | 'rdbu' | 'yellowBlue' | 'spectral' | 'greens' | 'oranges' | 'purples' | 'reds' | 'YlGnBu';

interface HeatMapConfig {
    cellType: CellType;
    colorScheme: ColorScheme;
    colorScalePadding: number;  // Percentage padding for color scale
    minScore: number;  // Optional manual override for min score
    maxScore: number;  // Optional manual override for max score
}

interface StackedHeatMapConfig {
    cellType: CellType;
    colorSchemes: ColorScheme[];
    colorScalePadding: number;  // Percentage padding for color scale
    minScore: number;  // Optional manual override for min score
    maxScore: number;  // Optional manual override for max score
    expandedCellType: ExpandedCellType;
}

export type {
    HeatMapConfig, 
    StackedHeatMapConfig,
    CellType,
}