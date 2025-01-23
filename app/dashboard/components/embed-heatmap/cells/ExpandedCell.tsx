// components/cells/ExpandedCell.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface ExpandedCellProps {
    sourceColumn: string;
    targetColumn: string;
    score: number;
    x: number;
    y: number;
    width: number;   // Now taking width from parent's scaling
    height: number;  // Now taking height from parent's scaling
    onClose: () => void;
}

export const ExpandedCell: React.FC<ExpandedCellProps> = ({
    sourceColumn,
    targetColumn,
    score,
    x,
    y,
    width,
    height,
    onClose
}) => {
    // Generate random distribution data for visualization
    const distribution = React.useMemo(() => {
        return Array.from({ length: 10 }, () => ({
            bin: Math.random(),
            source: Math.random() * 100,
            target: Math.random() * 100
        })).sort((a, b) => a.bin - b.bin);
    }, [sourceColumn, targetColumn]);

    return (
        <g transform={`translate(${x}, ${y})`}>
            <rect
                width={width}
                height={height}
                fill="white"
                stroke="#000"
                strokeWidth={1}
            />
            <foreignObject
                width={width}
                height={height}
            >
                <div style={{ padding: '16px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                    }}>
                        <div>
                            <strong>{sourceColumn}</strong> → <strong>{targetColumn}</strong>
                            <div>Correlation: {score.toFixed(2)}</div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <BarChart
                        width={width - 40}
                        height={height - 80}
                        data={distribution}
                        margin={{ top: 10, right: 10, bottom: 20, left: 20 }}
                    >
                        <XAxis dataKey="bin" tickFormatter={(value: number) => value.toFixed(1)} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="source" fill="#8884d8" name={sourceColumn} />
                        <Bar dataKey="target" fill="#82ca9d" name={targetColumn} />
                    </BarChart>
                </div>
            </foreignObject>
        </g>
    );
};