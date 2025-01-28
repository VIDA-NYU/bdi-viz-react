// hooks/useCellExpansion.ts
import { useState, useCallback } from 'react';
import { CellData } from '../cells/types';

const EXPANDED_CELL_SIZE = 200;

const useCellExpansion = () => {
    const [expandedCell, setExpandedCell] = useState<CellData | null>(null);

    const getCellDimensions = useCallback((cell: CellData, baseWidth: number, baseHeight: number) => {
        if (expandedCell?.sourceColumn === cell.sourceColumn && 
            expandedCell?.targetColumn === cell.targetColumn) {
            return {
                width: EXPANDED_CELL_SIZE,
                height: EXPANDED_CELL_SIZE,
                isExpanded: true
            };
        }
        return {
            width: baseWidth,
            height: baseHeight,
            isExpanded: false
        };
    }, [expandedCell]);

    return {
        expandedCell,
        setExpandedCell,
        getCellDimensions,
        EXPANDED_CELL_SIZE
    };
};

export { useCellExpansion };