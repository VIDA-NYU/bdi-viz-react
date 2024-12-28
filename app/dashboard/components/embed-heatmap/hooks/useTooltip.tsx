// hooks/useTooltip.ts
import { useState, useCallback } from 'react';
import { CellData } from '../cells/types';

const useTooltip = () => {
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        content: string;
    }>({
        visible: false,
        x: 0,
        y: 0,
        content: ''
    });

    const showTooltip = useCallback((event: React.MouseEvent, data: CellData) => {
        setTooltip({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            content: `
                <div>
                    <div>Source: ${data.sourceColumn}</div>
                    <div>Target: ${data.targetColumn}</div>
                    <div>Score: ${data.score.toFixed(3)}</div>
                </div>
            `
        });
    }, []);

    const hideTooltip = useCallback(() => {
        setTooltip(prev => ({ ...prev, visible: false }));
    }, []);

    return { tooltip, showTooltip, hideTooltip };
};

export { useTooltip };