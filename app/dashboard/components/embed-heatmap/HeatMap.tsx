// components/HeatMap.tsx
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
    // Get filtered data
    const filteredData = useMemo(() => {
        let result = [...data];
        
        if (filters?.sourceColumn) {
            const sourceCluster = sourceClusters?.find(sc => 
                sc.sourceColumn === filters.sourceColumn
            );
            let cluster = sourceCluster?.cluster;
            
            if (cluster && filters.similarSources) {
                cluster = cluster.slice(0, filters.similarSources);
            }
            
            result = cluster 
                ? result.filter(d => cluster?.includes(d.sourceColumn))
                    .sort((a, b) => cluster.indexOf(a.sourceColumn) - cluster.indexOf(b.sourceColumn))
                : result.filter(d => d.sourceColumn === filters.sourceColumn);
        }

        if (filters?.candidateThreshold) {
            result = result.filter(d => d.score >= filters.candidateThreshold);
        }

        return result;
    }, [data, filters, sourceClusters]);
    // console.log(filters, 'filteredData');
    // Setup scales
    // const { x, y, color, cellWidth, cellHeight, dataRange } = useHeatmapScales({
    //     data: filteredData,
    //     width: dimensions.width,
    //     height: dimensions.height,
    //     margin: MARGIN,
    //     config
    // });

    const { 
        x, y, color, getWidth, getHeight, 
        expandedState, handleExpand, handleCollapse, 
        dataRange 
    } = useHeatmapScales({
        data: filteredData,
        width: dimensions.width,
        height: dimensions.height,
        margin: MARGIN,
        config
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
    // console.log(dimensions);
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
                                if (
                                    expandedState.expandedCell && expandedState.expandedCell == d 
                                ){
                                    return (<
                                        BaseExpandedCell
                                        type={'histogram'}
                                        key={`${d.sourceColumn}-${d.targetColumn}`}
                                        data={d}
                                        sourceColumn={d.sourceColumn}
                                        targetColumn={d.targetColumn}
                                        onClose={handleCollapse}
                                        width={getWidth(d)}
                                        height={getHeight(d)}
                                        x={x(d.targetColumn) ?? 0}
                                        y={y(d.sourceColumn) ?? 0}
                                        />);
                                }
                                
                                return (<CellComponent
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
                                isExpanded={expandedState.expandedCell === d}
                                onHover={showTooltip}
                                onLeave={hideTooltip}
                                onClick={() => {
                                    handleCellClick(d);
                                    if (expandedState.expandedCell === d) {
                                        handleCollapse();
                                    } else {
                                        handleExpand(d);
                                    }
                                }}
                            />);
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
                                <g key={value} transform={`translate(${xPos + width/2},0)`}>
                                    <text
                                        transform="rotate(45)"
                                        dy=".35em"
                                        textAnchor="start"
                                        style={{
                                            fontSize: expandedState.expandedCell ? '0.8em' : '1em',
                                            opacity: expandedState.expandedCell?.targetColumn === value ? 1 : 0.7
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
                                    <g key={value} transform={`translate(-5,${yPos + height/2})`}>
                                        <text
                                            dy=".35em"
                                            textAnchor="end"
                                            style={{
                                                fontSize: expandedState.expandedCell ? '0.8em' : '1em',
                                                opacity: expandedState.expandedCell?.sourceColumn === value ? 1 : 0.7
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