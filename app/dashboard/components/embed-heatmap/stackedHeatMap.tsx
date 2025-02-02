import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Container, Typography } from '@mui/material';
import { RectCell } from './cells/RectCell';
import { useStackedHeatmapScales } from './hooks/useStackedHeatmapScales';
import { useTooltip } from './hooks/useTooltip';
import { CellData } from './cells/types';
import { BaseExpandedCell } from './expanded-cells/BaseExpandedCell';
import { StackedHeatMapConfig } from './types';

interface StackedHeatMapProps {
    data: CellData[];
    sourceClusters?: SourceCluster[];
    selectedMatchers?: Matcher[];
    setSelectedCandidate?: (candidate: CellData | undefined) => void;
    filters?: {
        selectedCandidate?: CellData;
        sourceColumn: string;
        candidateType: string;
        similarSources: number;
        candidateThreshold: number;
    };
}

const MARGIN = { top: 65, right: 110, bottom: 70, left: 90 };

const StackedHeatMap: React.FC<StackedHeatMapProps> = ({
    data,
    sourceClusters,
    selectedMatchers,
    filters,
    setSelectedCandidate,
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

    const { filteredData, filteredCluster } = useMemo(() => {
        let filteredData = [...data];
        let filteredCluster: string[] | undefined;

        // filter by matchers
        if (selectedMatchers) {
            const selectedMatcherNames = selectedMatchers.map((m) => m.name);
            filteredData = filteredData.filter((d) => d.matcher && selectedMatcherNames.includes(d.matcher));
        }

        if (filters?.sourceColumn) {
            const sourceCluster = sourceClusters?.find(sc =>
                sc.sourceColumn === filters.sourceColumn
            );
            filteredCluster = sourceCluster?.cluster;
            if (filteredCluster !== undefined) {
                if (filters.similarSources) {
                    filteredCluster = filteredCluster.slice(0, filters.similarSources);
                }

                filteredData = filteredCluster
                    ? filteredData.filter(d => filteredCluster?.includes(d.sourceColumn))
                        .sort((a, b) => (filteredCluster?.indexOf(a.sourceColumn) ?? 0) - (filteredCluster?.indexOf(b.sourceColumn) ?? 0))
                    : filteredData.filter(d => d.sourceColumn === filters.sourceColumn);
            }
        }

        if (filters?.candidateThreshold) {
            filteredData = filteredData.filter((d) => d.score >= filters.candidateThreshold);
        }

        return { filteredData, filteredCluster };
    }, [data, filters, sourceClusters]);

    const {
        scales,
        getWidth,
        getHeight,
        padding,
        dataRange
    } = useStackedHeatmapScales({
        data: filteredData,
        sourceCluster: filteredCluster,
        matchers: matchers ?? [],
        width: dimensions.width,
        height: dimensions.height,
        margin: MARGIN,
        config,
        selectedCandidate: filters?.selectedCandidate,
    });

    const { tooltip, showTooltip, hideTooltip } = useTooltip();

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: Math.max(200, 600 / matchers.length),
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [matchers.length]);

    const handleCellClick = useCallback(
        (cellData: CellData) => {
            if (setSelectedCandidate) {
                if (
                    filters?.selectedCandidate &&
                    filters.selectedCandidate.sourceColumn === cellData.sourceColumn &&
                    filters.selectedCandidate.targetColumn === cellData.targetColumn
                ) {
                    setSelectedCandidate(undefined);
                } else {
                    setSelectedCandidate(cellData);
                }
            }
        },
        [setSelectedCandidate, filters]
    );

    const CellComponent = config.cellType === 'rect' ? RectCell : RectCell;

    return (
        <Container>
            <Card ref={containerRef} sx={{ paddingLeft: 4 }}>
                {matchers.map((matcher) => {
                    const matcherScale = scales?.find((s) => s.matcher === matcher);
                    if (!matcherScale) return null;

                    return (
                        <>
                            <Typography
                                style={{
                                            textAlign: 'left',
                                            marginBottom: '10px',
                                            position: 'absolute',
                                            opacity: 1,
                                            width: 'fit-content',
                                            pointerEvents: 'none',
                                            transform: `translateY(20px)`,
                                            background: `linear-gradient(to right, ${matcherScale?.color(1)}, ${matcherScale?.color(0.2)})`, // Example gradient for 'blues' color scheme
                                            color: 'white',
                                            fontWeight: 'bold',
                                            padding: '8px',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        {matcher}
                            </Typography>
                            <svg
                                key={matcher}
                                width={dimensions.width}
                                height={dimensions.height}
                                style={{ overflow: 'visible' }}
                            >
                                <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                                    {filteredData
                                        .filter((d) => d.matcher === matcher)
                                        .map((d: any, i: number) => {
                                        if (filters?.selectedCandidate && filters?.selectedCandidate &&
                                            filters.selectedCandidate.sourceColumn === d.sourceColumn &&
                                            filters.selectedCandidate.targetColumn === d.targetColumn &&
                                            filters.selectedCandidate.matcher === d.matcher
                                        ) {
                                            return (
                                                <BaseExpandedCell
                                                    type={'histogram'}
                                                    key={`${d.sourceColumn}-${d.targetColumn}`}
                                                    data={d}
                                                    sourceColumn={d.sourceColumn}
                                                    targetColumn={d.targetColumn}
                                                    onClose={() => {
                                                        console.log('close!!!!!!!!!!');
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
                                                    isSelected={filters?.selectedCandidate?.sourceColumn === d.sourceColumn &&
                                                        filters?.selectedCandidate?.targetColumn === d.targetColumn}
                                                    onHover={showTooltip}
                                                    onLeave={hideTooltip}
                                                    onClick={() => {
                                                        handleCellClick(d);
                                                    }}
                                                />
                                            );
                                        }
                                    })}

                                    {/* Axes */}
                                    <g transform={`translate(0,${matcherScale.y.range()[1]})`}>
                                        <line x1={0} x2={matcherScale.x.range()[1]} stroke="black" />
                                        {matcherScale.x.domain().map((value) => (
                                            <g
                                                key={value}
                                                transform={`translate(${
                                                    matcherScale.x({
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
                                </g>
                            </svg>
                        </>
                    );
                })}

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
        </Container>
    );
};

export default StackedHeatMap;
