// components/SchemaViz/index.tsx
import React, { useMemo, useState } from 'react';
import { Box, Card } from '@mui/material';
import { useSchemaLayout } from './useScatterLayout';
import { FeatureCircle } from './FeatureCircle';
import { ClusterSelector } from './ClusterSelector';
import { line, curveBasis } from 'd3';
import { ClusterBackground } from './ClusterBackground';
import { getClusterColors } from './colors';

interface SchemaVizProps {
    candidates: Candidate[];
    width?: number;
    height?: number;
}

export const DualScatter: React.FC<SchemaVizProps> = ({
    candidates,
    width = 1200,
    height = 800
}) => {
    const { sourceNodes, targetNodes, links } = useSchemaLayout(candidates);
    const [selectedClusters, setSelectedClusters] = useState<string[]>([]);

    // Get unique clusters
    const clusters = [...new Set([
        ...sourceNodes.map(n => n.cluster),
        ...targetNodes.map(n => n.cluster)
    ])];

    // Create curved links
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
            const path = createPath([
                [actualSourceX, actualSourceY],
                [(actualSourceX + actualTargetX) / 2, (actualTargetY + actualSourceY) / 2],
                [actualTargetX, actualTargetY]
            ]);

            return (
                <path
                    key={i}
                    d={path || undefined}
                    stroke="#999"
                    strokeWidth={link.score}
                    fill="none"
                    opacity={0.3}
                />
            );
        });
    };
    const clusterColorScale = useMemo(() => 
        getClusterColors(clusters), [clusters]);

    const margin = {
        top: 20,
        right: 20,
        left: 20,
        bottom: 20,
    }
    console.log(sourceNodes, targetNodes, links, selectedClusters, 'hello');   
    return (
        <Card
            sx={{
                flexGrow: 1
            }}
        >

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
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
            <Card>

            <svg width={width} height={height}>
                    <g transform={`translate(${width/2}, ${3 * height/4})`}>
                        {selectedClusters.map(cluster => (
                            <ClusterBackground
                                key={cluster}
                                nodes={targetNodes}
                                cluster={cluster}
                                color={clusterColorScale(cluster)}
                            />
                        ))}
                    </g>
                <g transform={`translate(${width/2}, ${height/4})`}>
                    {sourceNodes.slice(0, 9).map((node, i) => (
                        <g
                            key={i}
                            transform={`translate(${node.coordinates.x},${node.coordinates.y})`}
                        >
                            <FeatureCircle
                                features={node.features}
                                size={40}
                                selected={selectedClusters.includes(node.cluster)}
                            />
                        </g>
                    ))}
                </g>
                <g transform={`translate(${width/2}, ${height*3/4})`}>
                    {targetNodes.slice(0, 8).map((node, i) => (
                        <g
                            key={i}
                            transform={`translate(${node.coordinates.x},${node.coordinates.y})`}
                        >
                            <FeatureCircle
                                features={node.features}
                                size={40}
                                selected={selectedClusters.includes(node.cluster)}
                            />
                        </g>
                    ))}
                </g>
                
                {renderLinks()}
            </svg>
            </Card>
        </Box>

        </Card>
    );
};

