import { useState, useCallback, useEffect } from 'react';
import { getColumns } from '../utils/column';

type DashboardFilterState = {
    highlightedSourceColumns: Array<string>
    highlightedTargetColumns: Array<string>
    updateHighlightedSourceColumns: (columns: Array<string>) => void
    updateHighlightedTargetColumns: (columns: Array<string>) => void
}

type DashboardHighlightProps = {
    candidates: Candidate[];
    searchResults: Candidate[];
}


const useDashboardHighlight = ({candidates, searchResults}: DashboardHighlightProps) => {
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

    useEffect(() => {
        if (searchResults.length > 0) {
            const sourceColumns = Array.from(new Set(searchResults.map((result) => result.sourceColumn)));
            const targetColumns = Array.from(new Set(searchResults.map((result) => result.targetColumn)));
            setHighlightedSourceColumns(sourceColumns);
            setHighlightedTargetColumns(targetColumns);
        } else {
            setHighlightedSourceColumns([]);
            setHighlightedTargetColumns([]);
        }
    }, [searchResults]);

    return {
        highlightedSourceColumns,
        highlightedTargetColumns,
        updateHighlightedSourceColumns,
        updateHighlightedTargetColumns
    }
    
}

export { useDashboardHighlight };