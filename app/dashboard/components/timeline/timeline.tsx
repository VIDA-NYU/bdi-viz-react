"use client";

import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";
import { useTimeline } from "./useTimeline";
import { Box, useTheme, Typography } from '@mui/material';
import { SectionHeader } from '../../layout/components';

interface TimelineProps {
    userOperations: UserOperation[];
}

const Timeline = ({ userOperations }: TimelineProps) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    // const boxRef = useRef<HTMLDivElement | null>(null);
    const [expandedNode, setExpandedNode] = useState<number | null>(null);
    const theme = useTheme();

    const { nodes } = useTimeline({ userOperations });

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous content

        // const boxWidth = boxRef.current?.clientWidth || 200;
        const width = 290;
        const height = (nodes.length + 1) * 100; // Adjust height for the start node

        svg.attr("width", width).attr("height", height);

        svg
            .selectAll(".link")
            .data(nodes)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("x1", width / 2)
            .attr("y1", (d, i) => i * 100 + 50)
            .attr("x2", width / 2)
            .attr("y2", (d, i) => (i + 1) * 100 + 22)
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)");
        
        // Add start node
        const startNodeGroup = svg
            .append("g")
            .attr("class", "start-node")
            .attr("transform", `translate(${width / 2}, 50)`);

        startNodeGroup
            .append("circle")
            .attr("r", 15)
            .attr("fill", theme.palette.primary.main);

        const nodeGroup = svg
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d, i) => `translate(${width / 2}, ${(i + 1) * 100 + 50})`)
            .on("mouseover", (event, d) => {
                setExpandedNode(d.timelineId);
            })
            .on("mouseout", () => {
                setExpandedNode(null);
            });

        nodeGroup
            .append("circle")
            .attr("r", 25)
            .attr("fill", d => d.operation === 'accept' ? theme.palette.success.main : d.operation === 'reject' ? theme.palette.error.main : theme.palette.secondary.main);

        nodeGroup
            .append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", theme.palette.common.white)
            .attr("font-size", theme.typography.fontSize)
            .attr("font-weight", "400")
            .attr("font-family", `"Roboto","Helvetica","Arial",sans-serif`)
            .text(d => d.operation);

        if (expandedNode !== null) {
            const expandedNodeData = nodes.find(node => node.timelineId === expandedNode);
            if (expandedNodeData) {
                const expandedGroup = svg
                    .append("g")
                    .attr("class", "expanded-node")
                    .attr("transform", `translate(${width / 2}, ${(expandedNodeData.timelineId + 1) * 100 + 50})`);

                expandedGroup
                    .append("rect")
                    .attr("x", -(width-20)/2)
                    .attr("y", -50)
                    .attr("width", width-20)
                    .attr("height", 150)
                    .attr("rx", 10)
                    .attr("ry", 10)
                    .attr("fill", theme.palette.background.paper)
                    .attr("stroke", theme.palette.info.main)
                    .attr("stroke-width", 1);

                expandedGroup
                    .append("foreignObject")
                    .attr("x", -(width-20)/2)
                    .attr("y", -40)
                    .attr("width", width-20)
                    .attr("height", 150)
                    .append("xhtml:div")
                    .style("font-size", theme.typography.fontSize)
                    .attr("font-weight", "300")
                    .style("font", `"Roboto","Helvetica","Arial",sans-serif`)
                    .style("text-align", "center")
                    .style("padding", "10px")
                    .style("color", theme.palette.text.primary)
                    .html(`
                        <b>Operation:</b> ${expandedNodeData.operation}<br/>
                        <b>Candidate:</b><br/>
                        ${expandedNodeData.candidate?.sourceColumn}<br/>
                        ${expandedNodeData.candidate?.targetColumn}
                    `);
            }
        }

        svg
            .append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", theme.palette.primary.main);
    }, [nodes, expandedNode, theme]);

    return (
        <Box sx={{ maxHeight: '400px' }}>
            <SectionHeader>Timeline</SectionHeader>
            <Box sx={{ maxHeight: '380px', overflowY: 'auto'}}>
                <svg ref={svgRef}></svg>
            </Box>
        </Box>
    );
};

export default Timeline;