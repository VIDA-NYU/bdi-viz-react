import { useState, useCallback, useEffect, use } from 'react';
import { getColumns } from '../utils/column';

type DashboardFilterState = {
    highlightedSourceColumns: Array<string>
    highlightedTargetColumns: Array<string>
    updateHighlightedSourceColumns: (columns: Array<string>) => void
    updateHighlightedTargetColumns: (columns: Array<string>) => void
}

type DashboardHighlightProps = {
    candidates: Candidate[];
}


const useDashboardHighlight = ({candidates}: DashboardHighlightProps) => {
    const {
        sourceColumns, targetColumns
    } = getColumns(candidates);
    
    const [highlightedSourceColumns, setHighlightedSourceColumns] = useState<Array<string>>([]);
    const [highlightedTargetColumns, setHighlightedTargetColumns] = useState<Array<string>>([]);

    const updateHighlightedSourceColumns = useCallback((columns: Array<string>) => {
        setHighlightedSourceColumns(columns);
    }, []);

    const updateHighlightedTargetColumns = useCallback((columns: Array<string>) => {
        setHighlightedTargetColumns(columns);
    }, []);

    return {
        highlightedSourceColumns,
        highlightedTargetColumns,
        updateHighlightedSourceColumns,
        updateHighlightedTargetColumns
    }
    
}

export { useDashboardHighlight };