import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Grid } from '@mui/material';
import { RectCell } from './cells/RectCell';
import { BarCell } from './cells/BarCell';
import { CellData } from './cells/types';
import HeatMapControls from './HeatmapControls';
import { HeatMapConfig } from './types';
import { useHeatmapScales } from './hooks/useHeatmapScales';
import { useTooltip } from './hooks/useTooltip';
import { BaseExpandedCell } from './expanded-cells/BaseExpandedCell';

interface HeatMapProps {
    data: CellData[];
    sourceClusters?: SourceCluster[];
    selectedMatchers?: string[];
    setSelectedCandidate?: (candidate: CellData | undefined) => void;
    filters?: {
        selectedCandidate?: CellData;
        sourceColumn: string;
        candidateType: string;
        similarSources: number;
        candidateThreshold: number;
    }
}

const MARGIN = { top: 80, right: 110, bottom: 100, left: 90 };

const HeatMap: React.FC<HeatMapProps> = ({ 
    data, 
    sourceClusters,
    selectedMatchers,
    filters,
    setSelectedCandidate 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
    const [config, setConfig] = useState<HeatMapConfig>({
        cellType: 'rect', // 'rect' | 'bar'
        colorScheme: 'blues', // 'blues' | 'viridis' | 'rdbu'
        colorScalePadding: 10,
        maxScore: 1,
        minScore: 0
    });

    const matcher = useMemo(() => {
        return selectedMatchers?.length === 1 ? selectedMatchers[0] : undefined;
    }, [selectedMatchers]);

    // Get filtered data
    const {filteredData, filteredCluster} = useMemo(() => {
        let filteredData = [...data];
        let filteredCluster: string[] | undefined;

        // Filter by matcher
        if (matcher) {
            filteredData = filteredData.filter(d => d.matcher === matcher);
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
            filteredData = filteredData.filter(d => d.score >= filters.candidateThreshold);
        }

        return {
            filteredData,
            filteredCluster,
        };
    }, [data, filters, sourceClusters]);

    // Setup scales
    const { 
        x,
        y,
        color,
        getWidth,
        getHeight,
        dataRange 
    } = useHeatmapScales({
        data: filteredData,
        sourceCluster: filteredCluster,
        width: dimensions.width,
        height: dimensions.height,
        margin: MARGIN,
        config,
        selectedCandidate: filters?.selectedCandidate
    });

    // Setup tooltip
    const { tooltip, showTooltip, hideTooltip } = useTooltip();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth - 16,
                    height: 400
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle cell click
    const handleCellClick = useCallback((cellData: CellData) => {
        if (setSelectedCandidate) {
            if (filters?.selectedCandidate &&
                filters.selectedCandidate.sourceColumn === cellData.sourceColumn &&
                filters.selectedCandidate.targetColumn === cellData.targetColumn) {
                setSelectedCandidate(undefined);
            } else {
                setSelectedCandidate(cellData);
            }
        }
    }, [setSelectedCandidate, filters]);

    const CellComponent = config.cellType === 'rect' ? RectCell : BarCell;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
                <HeatMapControls
                    config={config}
                    onConfigChange={setConfig}
                    dataRange={dataRange}
                />
            </Grid>
            <Grid item xs={12} md={9}>
                <Card ref={containerRef}
                    sx={{
                        paddingLeft: 8,
                    }}
                >
                    <svg
                        width={dimensions.width}
                        height={dimensions.height}
                        style={{ overflow: 'visible' }}
                    >
                        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                            {/* Draw cells */}
                            {filteredData.map((d: any, i: number) => {
                                if (filters?.selectedCandidate && filters?.selectedCandidate &&
                                    filters.selectedCandidate.sourceColumn === d.sourceColumn &&
                                    filters.selectedCandidate.targetColumn === d.targetColumn) {
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
                                            x={x(d.targetColumn) ?? 0}
                                            y={y(d.sourceColumn) ?? 0}
                                        />
                                    );
                                } else {
                                    return (
                                        <CellComponent
                                            key={`${d.sourceColumn}-${d.targetColumn}`}
                                            data={d}
                                            config={config}
                                            x={x(d.targetColumn) ?? 0}
                                            y={y(d.sourceColumn) ?? 0}
                                            width={getWidth(d)}
                                            height={getHeight(d)}
                                            color={color}
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
                            <g transform={`translate(0,${y.range()[1]})`}>
                                <line
                                    x1={0}
                                    x2={x.range()[1]}
                                    stroke="black"
                                />
                                {x.domain().map(value => {
                                    const xPos = x(value)!;
                                    const width = getWidth({ targetColumn: value } as CellData);
                                    return (
                                        <g key={value} transform={`translate(${xPos + width / 2},0)`}>
                                            <text
                                                transform="rotate(45)"
                                                dy=".35em"
                                                textAnchor="start"
                                                style={{
                                                    fontSize: filters?.selectedCandidate ? '0.8em' : '1em',
                                                    opacity: filters?.selectedCandidate?.targetColumn === value ? 1 : 0.7
                                                }}
                                            >
                                                {value}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                            <g>
                                <line
                                    y1={0}
                                    y2={y.range()[1]}
                                    stroke="black"
                                />
                                {y.domain().map(value => {
                                    const yPos = y(value)!;
                                    const height = getHeight({ sourceColumn: value } as CellData);
                                    return (
                                        <g key={value} transform={`translate(-5,${yPos + height / 2})`}>
                                            <text
                                                dy=".35em"
                                                textAnchor="end"
                                                style={{
                                                    fontSize: filters?.selectedCandidate ? '0.8em' : '1em',
                                                    opacity: filters?.selectedCandidate?.sourceColumn === value ? 1 : 0.7
                                                }}
                                            >
                                                {value}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        </g>
                    </svg>
                </Card>
            </Grid>
            {/* Tooltip */}
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
                        pointerEvents: 'none'
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}
        </Grid>
    );
};

export default HeatMap;
