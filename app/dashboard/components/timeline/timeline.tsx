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
    const [expandedNode, setExpandedNode] = useState<number | null>(null);
    const theme = useTheme();

    const { nodes } = useTimeline({ userOperations });

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous content

        const width = 290;
        const height = (nodes.length + 1) * 100; // Adjust height for the start node

        svg.attr("width", width).attr("height", height);

        svg
            .selectAll(".link")
            .data(nodes)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("x1", 50)
            .attr("y1", (d, i) => i * 100 + 50)
            .attr("x2", 50)
            .attr("y2", (d, i) => (i + 1) * 100 + 22)
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)");
        
        // Add start node
        const startNodeGroup = svg
            .append("g")
            .attr("class", "start-node")
            .attr("transform", `translate(50, 50)`);

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
            .attr("transform", (d, i) => `translate(50, ${(i + 1) * 100 + 50})`)
            .on("mouseover", (event, d) => {
                setExpandedNode(d.timelineId);
            })
            .on("mouseout", () => {
                setExpandedNode(null);
            });

        nodeGroup
            .append("circle")
            .attr("r", 20)
            .attr("fill", d => d.operation === 'accept' ? theme.palette.success.main : d.operation === 'reject' ? theme.palette.error.main : theme.palette.secondary.main);

        nodeGroup
            .append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", theme.palette.common.white)
            .attr("font-size", "0.7rem")
            .attr("font-weight", "400")
            .attr("font-family", `"Roboto","Helvetica","Arial",sans-serif`)
            .text(d => d.operation);

        nodeGroup
            .append("foreignObject")
            .attr("x", 30)
            .attr("y", -15)
            .attr("width", 200)
            .attr("height", 50)
            .append("xhtml:div")
            .style("background", theme.palette.grey[200])
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("font-size", "0.7rem")
            .style("font-family", `"Roboto","Helvetica","Arial",sans-serif`)
            .html(d => `
                <b>${d.candidate?.sourceColumn}</b> -> ${d.candidate?.targetColumn}
            `);

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
            <Box sx={{ maxHeight: '380px', overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            <svg ref={svgRef}></svg>
            </Box>
        </Box>
    );
};

export default Timeline;