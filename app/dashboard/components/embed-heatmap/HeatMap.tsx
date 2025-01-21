import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Grid } from '@mui/material';
import * as d3 from 'd3';
import { RectCell } from './cells/RectCell';
import { BarCell } from './cells/BarCell';
import HeatMapControls from './HeatmapControls';
import { useHeatmapScales } from './hooks/useHeatmapScales';
import { useTooltip } from './hooks/useTooltip';
import { CellData } from './cells/types';
import { HeatMapConfig } from './types';
import { getColorInterpolator } from './utils/color';

interface SourceCluster {
    sourceColumn: string;
    cluster: string[];
}

interface HeatMapProps {
    data: CellData[];
    sourceClusters?: SourceCluster[];
    setSelectedCandidate?: (candidate: CellData | undefined) => void;
    filters?: {
        selectedCandidate?: CellData;
        sourceColumn: string;
        candidateType: string;
        similarSources: number;
        candidateThreshold: number;
    };
}

const MARGIN = { top: 80, right: 110, bottom: 100, left: 90 };

const HeatMap: React.FC<HeatMapProps> = ({
    data,
    sourceClusters,
    filters,
    setSelectedCandidate,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
    const [config, setConfig] = useState<HeatMapConfig>({
        cellType: 'rect',
        colorScheme: 'blues',
        colorScalePadding: 10,
        maxScore: 1,
        minScore: 0,
    });

    const filteredData = useMemo(() => {
        let result = [...data];
        if (filters?.sourceColumn) {
            const sourceCluster = sourceClusters?.find(
                (sc) => sc.sourceColumn === filters.sourceColumn
            );
            let cluster = sourceCluster?.cluster;
            if (cluster && filters.similarSources) {
                cluster = cluster.slice(0, filters.similarSources);
            }
            result = cluster
                ? result
                        .filter((d) => cluster?.includes(d.sourceColumn))
                        .sort(
                            (a, b) =>
                                cluster.indexOf(a.sourceColumn) - cluster.indexOf(b.sourceColumn)
                        )
                : result.filter((d) => d.sourceColumn === filters.sourceColumn);
        }
        if (filters?.candidateThreshold) {
            result = result.filter((d) => d.score >= filters.candidateThreshold);
        }
        return result;
    }, [data, filters, sourceClusters]);

    const matchers = useMemo(() => {
        const matcherSet = new Set(
            data.map((d) => d.matcher).filter((m): m is string => m !== undefined)
        );
        return Array.from(matcherSet);
    }, [data]);

    const { scales, dataRange } = useHeatmapScales({
        data: filteredData,
        width: dimensions.width,
        height: dimensions.height,
        margin: MARGIN,
        matchers,
        config,
    });

    const { tooltip, showTooltip, hideTooltip } = useTooltip();

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: 250,
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const CellComponent = config.cellType === 'rect' ? RectCell : BarCell;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
                <HeatMapControls config={config} onConfigChange={setConfig} dataRange={dataRange} />
            </Grid>
            <Grid item xs={12} md={9}>
                <Card ref={containerRef} sx={{ paddingLeft: 4 }}>
                    {matchers.map((matcher) => {
                        const matcherScale = scales.filter((s) => s.matcher === matcher)[0];
                        if (!matcherScale) return null;

                        return (
                            <svg
                                key={matcher}
                                width={dimensions.width}
                                height={dimensions.height}
                                style={{ overflow: 'visible' }}
                            >
                                <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                                    {filteredData
                                        .filter((d) => d.matcher === matcher)
                                        .map((d) => (
                                            <CellComponent
                                                key={`${d.sourceColumn}-${d.targetColumn}`}
                                                data={d}
                                                config={config}
                                                x={matcherScale.x(d.targetColumn) ?? 0}
                                                y={matcherScale.y(d.sourceColumn) ?? 0}
                                                width={matcherScale.cellWidth ?? 0}
                                                height={matcherScale.cellHeight ?? 0}
                                                color={matcherScale.color ?? d3.scaleSequential(getColorInterpolator(config.colorScheme))
                                                    .domain([dataRange.min - dataRange.padding, dataRange.max + dataRange.padding])(d.score)
                                                }
                                                isSelected={
                                                    filters?.selectedCandidate?.sourceColumn === d.sourceColumn &&
                                                    filters?.selectedCandidate?.targetColumn === d.targetColumn
                                                }
                                                onHover={showTooltip}
                                                onLeave={hideTooltip}
                                                onClick={handleCellClick}
                                            />
                                        ))}
                                    <g transform={`translate(0,${matcherScale.y.range()[1]})`}>
                                        <line x1={0} x2={matcherScale.x.range()[1]} stroke="black" />
                                        {matcherScale.x.domain().map((value) => (
                                            <g
                                                key={value}
                                                transform={`translate(${
                                                    matcherScale.x(value)! + matcherScale.cellWidth / 2
                                                },0)`}
                                            >
                                                <text transform="rotate(45)" dy=".35em" textAnchor="start">
                                                    {value}
                                                </text>
                                            </g>
                                        ))}
                                    </g>
                                    <g>
                                        <line y1={0} y2={matcherScale.y.range()[1]} stroke="black" />
                                        {matcherScale.y.domain().map((value) => (
                                            <g
                                                key={value}
                                                transform={`translate(-5,${
                                                    matcherScale.y(value)! + matcherScale.cellHeight / 2
                                                })`}
                                            >
                                                <text dy=".35em" textAnchor="end">
                                                    {value}
                                                </text>
                                            </g>
                                        ))}
                                    </g>
                                </g>
                            </svg>
                        );
                    })}
                </Card>
            </Grid>
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
        </Grid>
    );
};

export default HeatMap;
