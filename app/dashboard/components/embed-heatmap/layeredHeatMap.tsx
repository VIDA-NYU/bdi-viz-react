import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Box, Typography } from '@mui/material';
import { RectCell } from './cells/RectCell';
import { useStackedHeatmapScales } from './hooks/useStackedHeatmapScales';
import { useTooltip } from './hooks/useTooltip';
import { BaseExpandedCell } from './expanded-cells/BaseExpandedCell';
import { StackedHeatMapConfig } from './types';

interface LayeredHeatMapProps {
    data: Candidate[];
    sourceCluster?: string[];
    selectedCandidate?: Candidate;
    setSelectedCandidate?: (candidate: Candidate | undefined) => void;
    selectedMatchers?: Matcher[];
}

const MARGIN = { top: 30, right: 0, bottom: 70, left: 200 };

const LayeredHeatMap: React.FC<LayeredHeatMapProps> = ({
    data,
    sourceCluster,
    selectedCandidate,
    setSelectedCandidate,
    selectedMatchers,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 1000 });
    const [config, setConfig] = useState<StackedHeatMapConfig>({
        cellType: 'rect',
        colorSchemes: ['blues', 'greens', 'oranges', 'purples', 'reds'],
        colorScalePadding: 10,
        maxScore: 1,
        minScore: 0,
    });

    const matchers = useMemo(() => {
        return selectedMatchers ? selectedMatchers.map((m) => m.name) : [...new Set(data.map((d) => d.matcher))];
    }, [data, selectedMatchers]);

    const {
        scales,
        getWidth,
        getHeight,
        padding,
        dataRange
    } = useStackedHeatmapScales({
        data: data,
        sourceCluster: sourceCluster,
        matchers: matchers ?? [],
        width: dimensions.width,
        height: dimensions.height,
        margin: MARGIN,
        config,
        selectedCandidate: selectedCandidate,
    });

    const { tooltip, showTooltip, hideTooltip } = useTooltip();

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: 500,
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [matchers.length]);

    const handleCellClick = useCallback(
        (cellData: Candidate) => {
            if (setSelectedCandidate) {
                if (
                    selectedCandidate &&
                    selectedCandidate.sourceColumn === cellData.sourceColumn &&
                    selectedCandidate.targetColumn === cellData.targetColumn
                ) {
                    setSelectedCandidate(undefined);
                } else {
                    setSelectedCandidate(cellData);
                }
            }
        },
        [setSelectedCandidate, selectedCandidate]
    );

    const CellComponent = config.cellType === 'rect' ? RectCell : RectCell;

    return (
        <Box>
            <Card ref={containerRef} sx={{ paddingLeft: 0 }}>
                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{ overflow: 'visible' }}
                >
                    <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                        {matchers.map((matcher) => {
                            const matcherScale = scales?.find((s) => s.matcher === matcher);
                            if (!matcherScale) return null;

                            return (
                                <g key={matcher}>
                                    {data
                                        .filter((d) => d.matcher === matcher)
                                        .map((d: any, i: number) => {
                                            const opacity = 1 / matchers.length;
                                            if (selectedCandidate &&
                                                selectedCandidate.sourceColumn === d.sourceColumn &&
                                                selectedCandidate.targetColumn === d.targetColumn &&
                                                selectedCandidate.matcher === d.matcher
                                            ) {
                                                return (
                                                    <BaseExpandedCell
                                                        type={'histogram'}
                                                        key={`${d.sourceColumn}-${d.targetColumn}`}
                                                        data={d}
                                                        sourceColumn={d.sourceColumn}
                                                        targetColumn={d.targetColumn}
                                                        onClose={() => {
                                                            handleCellClick(d);
                                                        }}
                                                        width={getWidth(d)}
                                                        height={getHeight(d)}
                                                        x={matcherScale.x(d) ?? 0}
                                                        y={matcherScale.y(d) ?? 0}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <CellComponent
                                                        key={`${d.sourceColumn}-${d.targetColumn}`}
                                                        data={d}
                                                        config={config}
                                                        x={matcherScale.x(d) ?? 0}
                                                        y={matcherScale.y(d) ?? 0}
                                                        width={getWidth(d)}
                                                        height={getHeight(d)}
                                                        color={matcherScale.color}
                                                        opacity={opacity}
                                                        isSelected={selectedCandidate?.sourceColumn === d.sourceColumn &&
                                                            selectedCandidate?.targetColumn === d.targetColumn}
                                                        onHover={showTooltip}
                                                        onLeave={hideTooltip}
                                                        onClick={() => {
                                                            handleCellClick(d);
                                                        }}
                                                    />
                                                );
                                            }
                                        })}
                                </g>
                            );
                        })}

                        {/* Axes */}
                        {scales && scales[0] && (
                            <g transform={`translate(0,${scales[0].y.range()[1]})`}>
                                <line x1={0} x2={scales[0].x.range()[1]} stroke="black" />
                                {scales[0].x.domain().map((value: string) => (
                                    <g
                                        key={value}
                                        transform={`translate(${
                                            scales[0].x({
                                                targetColumn: value,
                                                sourceColumn: "",
                                                score: 0
                                            })! + getWidth({
                                                targetColumn: value,
                                                sourceColumn: "",
                                                score: 0
                                            }) / 2
                                        },0)`}
                                    >
                                        <text transform="rotate(45)" dy=".35em" textAnchor="start">
                                            {value}
                                        </text>
                                    </g>
                                ))}
                            </g>
                        )}
                        {scales && scales[0] && (
                            <g>
                                <line
                                    y1={0}
                                    y2={scales[0].y.range()[1]}
                                    stroke="black"
                                />
                                {scales[0].y.domain().map((value: string) => {
                                    const yPos = scales[0].y({
                                        matcher: "",
                                        sourceColumn: value,
                                        targetColumn: "",
                                        score: 0
                                    })!;
                                    const height = getHeight({ sourceColumn: value } as Candidate);
                                    return (
                                        <g key={value} transform={`translate(-5,${yPos + height / 2})`}>
                                            <text
                                                dy=".35em"
                                                textAnchor="end"
                                                style={{
                                                    fontSize: selectedCandidate ? '0.8em' : '1em',
                                                    opacity: selectedCandidate?.sourceColumn === value ? 1 : 0.7
                                                }}
                                            >
                                                {value}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        )}
                    </g>
                </svg>
            </Card>
            {tooltip.visible && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x + 10,
                        top: tooltip.y - 10,
                        background: 'white',
                        padding: '8px',
                        border: '1px solid black',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
        </Box>
    );
};

export default LayeredHeatMap;
