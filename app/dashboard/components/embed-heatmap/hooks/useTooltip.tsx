// hooks/useTooltip.ts
import { useState, useCallback } from 'react';

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

    const showTooltip = useCallback((event: React.MouseEvent, data: AggregatedCandidate) => {
        setTooltip({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            content: `
            <div style="font-family: Arial, sans-serif; font-size: 12px;">
                <div><strong>Source:</strong> ${data.sourceColumn}</div>
                <div><strong>Target:</strong> ${data.targetColumn}</div>
                <div><strong>Score:</strong> ${data.score.toFixed(3)}</div>
                ${data.matchers ? `
                    <div>
                        <strong>Matchers:</strong>
                        <ul style="list-style: disc; margin-left: 20px; padding: 0;">
                        ${data.matchers.map((matcher: string) => `<li style="margin-bottom: 4px;">${matcher}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div><strong>Status:</strong> ${data.status}</div>
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