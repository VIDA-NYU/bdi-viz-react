// types.ts
import { CellData } from "../cells/types";


interface ExpandedCellProps {
    sourceColumn: string;
    targetColumn: string;
    data: CellData;
    width: number; 
    height: number;
    onClose: () => void;
   }
   
   interface BaseExpandedCellProps extends ExpandedCellProps {
    x: number;
    y: number;
   }
// type ExpandedCellType = 'histogram' | 'correlation' | 'scatter' | 'distribution';

type ExpandedCellType = 'histogram' | 'scatter' 

export type { ExpandedCellProps, ExpandedCellType, BaseExpandedCellProps };