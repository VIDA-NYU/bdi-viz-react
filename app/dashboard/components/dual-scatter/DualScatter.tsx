// components/SchemaViz/index.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { useSchemaLayout } from './useScatterLayout';
import { FeatureCircle } from './FeatureCircle';
import { ClusterSelector } from './ClusterSelector';
import { line, curveBasis } from 'd3';
import { ClusterBackground } from './ClusterBackground';
import { getClusterColors } from './colors';
import { Box, Container, Card, Tooltip, Typography } from '@mui/material';
import { useLassoSelection } from './useLassoSelection';


interface SchemaVizProps {
    candidates: Candidate[];
    width?: number;
    height?: number;
}

// components/SchemaViz/index.tsx

export const DualScatter: React.FC<SchemaVizProps> = ({
    candidates,
    width = 1200,
    height = 800
}) => {
    const { sourceNodes, targetNodes, links } = useSchemaLayout(candidates);
    const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [manualClusters, setManualClusters] = useState<Array<{
        id: string,
        nodes: string[]
    }>>([]);

    const [manuallySelectedNodes, setManuallySelectedNodes] = useState<string[]>([]);


    
    const clusters = useMemo(() => [...new Set([
        ...sourceNodes.map(n => n.cluster),
        ...targetNodes.map(n => n.cluster)
    ])], [sourceNodes, targetNodes]);

    const clusterColorScale = useMemo(() => 
        getClusterColors(clusters), [clusters]);

    const {
        svgRef,
        isSelecting,
        selectionPath,
        selectedArea,
        startSelection,
        updateSelection,
        endSelection,
        isPointInSelection,
        clearSelection,
        getPathData
    } = useLassoSelection();


    const createClusterFromSelection = useCallback(() => {
        if (selectedArea.length < 3) return;

        const selectedNodes = sourceNodes
            .concat(targetNodes)
            .filter(node => {
                const transformedPoint = {
                    x: node.coordinates.x + width/2,
                    y: node.coordinates.y + (
                        targetNodes.includes(node) ? height * 3/4 : height/4
                    )
                };
                return isPointInSelection(transformedPoint);
            })
            .map(node => node.name);
        
        if (selectedNodes.length > 0) {
            setManualClusters(prev => [
                ...prev,
                {
                    id: `manual-cluster-${prev.length + 1}`,
                    nodes: selectedNodes
                }
            ]);
        }

        clearSelection();
    }, [selectedArea, sourceNodes, targetNodes, width, height, isPointInSelection]);
    const selectedNodes = sourceNodes
            .concat(targetNodes)
            .filter(node => {
                const transformedPoint = {
                    x: node.coordinates.x + width/2,
                    y: node.coordinates.y + (
                        targetNodes.includes(node) ? height * 3/4 : height/4
                    )
                };
                return isPointInSelection(transformedPoint);
            })
            .map(node => node.name);

    const createPath = line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(curveBasis);

    const renderLinks = () => {
        return links.map((link, i) => {
            const source = sourceNodes.find(n => n.name === link.sourceColumn);
            const target = targetNodes.find(n => n.name === link.targetColumn);
            
            if (!source || !target) return null;
            const actualSourceX = source.coordinates.x + width/4 + 70;
            const actualSourceY = source.coordinates.y + height/4;
            const actualTargetX = target.coordinates.x + width/4 + 70;
            const actualTargetY = target.coordinates.y + height*3/4;

            return (
                <path
                    key={i}
                    d={createPath([
                        [actualSourceX, actualSourceY],
                        [(actualSourceX + actualTargetX) / 2, (actualTargetY + actualSourceY) / 2],
                        [actualTargetX, actualTargetY]
                    ]) || undefined}
                    stroke="#999"
                    strokeWidth={link.score}
                    fill="none"
                    opacity={hoveredNode === source.name || hoveredNode === target.name ? 0.8 : 0.2}
                />
            );
        });
    };


    return (
        <Container>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ClusterSelector
                    clusters={clusters}
                    selectedClusters={selectedClusters}
                    onClusterToggle={(cluster) => {
                        setSelectedClusters(prev =>
                            prev.includes(cluster)
                                ? prev.filter(c => c !== cluster)
                                : [...prev, cluster]
                        );
                    }}
                />
                <Card sx={{ position: 'relative', bgcolor: '#fefefe' }}>
                    {/* Source Schema Label */}
                    <Box sx={{
                        position: 'absolute',
                        top: height/4 + 6 ,
                        left: 34,
                        p: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '4px 4px 0 0',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'left bottom'
                    }}>
                        <Typography variant="subtitle2">Source Schema</Typography>
                    </Box>

                    {/* Target Schema Label */}
                    <Box sx={{
                        position: 'absolute',
                        top: 3*height/4 + 6 ,
                        left: 34,
                        p: 1,
                        bgcolor: 'secondary.main',
                        color: 'white',
                        borderRadius: '4px 4px 0 0',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'left bottom'
                    }}>
                        <Typography variant="subtitle2">Target Schema</Typography>
                    </Box>

                    {/* Divider */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        width: '100%',
                        height: '2px',
                        bgcolor: 'divider',
                        opacity: 0.5
                    }} />

                    <svg width={width} height={height}
                        onMouseDown={startSelection}
                        onMouseMove={updateSelection}
                        onMouseUp={endSelection}
                        onMouseLeave={endSelection}
                        ref={svgRef}
                    >
                        {/* Source Section */}
                        {isSelecting && selectionPath.length > 1 && (
                            <path
                                d={getPathData(selectionPath)}
                                fill="rgba(0, 0, 255, 0.1)"
                                stroke="blue"
                                strokeWidth={1}
                                strokeDasharray="5,5"
                            />
                        )}
                        
                        {/* Render final selection area */}
                        {selectedArea.length > 2 && (
                            <path
                                d={getPathData(selectedArea)}
                                fill="rgba(0, 0, 255, 0.1)"
                                stroke="blue"
                                strokeWidth={1}
                            />
                        )}

                        <g transform={`translate(${width/2}, ${height/4})`}>
                            {selectedClusters.map(cluster => (
                                <ClusterBackground
                                    key={cluster}
                                    nodes={sourceNodes}
                                    cluster={cluster}
                                    color={clusterColorScale(cluster)}
                                />
                            ))}
                            {sourceNodes.slice(0, 9).map((node, i) => (
                                <Tooltip key={i} title={node.name}>
                                    <g
                                        transform={`translate(${node.coordinates.x},${node.coordinates.y})`}
                                        onMouseEnter={() => setHoveredNode(node.name)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FeatureCircle
                                            features={node.features}
                                            size={40}
                                            selected={selectedClusters.includes(node.cluster)}
                                        />
                                    </g>
                                </Tooltip>
                            ))}
                        </g>

                        {/* Target Section */}
                        <g id={"target-background"} transform={`translate(${width/2}, ${height*3/4})`}>
                            {selectedClusters.map(cluster => (
                                <ClusterBackground
                                    key={cluster}
                                    nodes={targetNodes}
                                    cluster={cluster}
                                    color={clusterColorScale(cluster)}
                                />
                            ))}
                        </g>
                        <g transform={`translate(${width/2}, ${height*3/4})`}>
                            
                            {targetNodes.slice(0, 8).map((node, i) => (
                                <Tooltip key={i} title={node.name}>
                                    <g
                                        transform={`translate(${node.coordinates.x},${node.coordinates.y})`}
                                        onMouseEnter={() => setHoveredNode(node.name)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FeatureCircle
                                            features={node.features}
                                            size={40}
                                            selected={selectedClusters.includes(node.cluster)}
                                        />
                                    </g>
                                </Tooltip>
                            ))}
                        </g>
                        
                        {renderLinks()}
                    </svg>
                </Card>
            </Box>
        </Container>
    );
};
