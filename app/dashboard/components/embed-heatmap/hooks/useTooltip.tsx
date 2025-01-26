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
                    <div><strong>Source:</strong> ${data.sourceColumn}</div>
                    <div><strong>Target:</strong> ${data.targetColumn}</div>
                    <div>Score: ${data.score.toFixed(3)}</div>
                    ${data.matcher ? `<div>Matcher: ${data.matcher}</div>` : ''}
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