import React, { useEffect, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";
import { TreeNode } from "../tree/types";
import { useResizedSVGRef } from "../../hooks/resize-hooks";

interface IndentedTreeAxisProps {
    targetTreeData: TreeNode[];
}

const MARGIN = { top: 0, right: 70, bottom: 0, left: 200 };

const IndentedTreeAxis: React.FC<IndentedTreeAxisProps> = ({ targetTreeData }) => {
    const theme = useTheme();
    const { svgHeight, svgWidth, ref: svgRef } = useResizedSVGRef();

    // Total SVG dimensions.
    const dimensions = useMemo(() => ({
        width: svgWidth,
        height: svgHeight,
    }), [svgWidth, svgHeight]);

    // Inner dimensions reduce margins.
    const innerWidth = useMemo(() => dimensions.width - MARGIN.left - MARGIN.right, [dimensions.width]);
    const innerHeight = useMemo(() => dimensions.height - MARGIN.top - MARGIN.bottom, [dimensions.height]);

    const truncateString = useCallback((str: string, maxLength: number, ellipsis: string = "..."): string => {
        if (str.length <= maxLength) {
            return str;
        }
        return str.slice(0, maxLength - ellipsis.length) + ellipsis;
    }, []);

    useEffect(() => {
        if (!targetTreeData || targetTreeData.length === 0) return;

        let parents: string[] = [];
        targetTreeData.forEach((node) => {
            if (node.children) {
                parents = [...parents, ...node.children.map((child) => child.label.text)];
            }
        });

        const getParentYOffset = (label: string) => {
            return parents.indexOf(label) * 10;
        }

        // Build hierarchy and compute layout.
        const root = d3.hierarchy(targetTreeData[0]);
        let index = 0;
        root.eachBefore(d => {
            d.index = index++;
        });
        const treeLayout = d3.tree<TreeNode>().nodeSize([40, 200]);
        treeLayout(root);

        const nodeSize = 40;
        // Use innerWidth and innerHeight for drawing.
        const newWidth = innerWidth;
        const newHeight = innerHeight;

        // Initialize and clear svg.
        const svg = d3.select(svgRef.current);

        svg.selectAll("*").remove();

        // Create a group element and translate by margins.
        const g = svg.append("g")
            .attr("transform", `translate(${MARGIN.left}, ${-30})`);

        // Create links.
        const link = g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", d => {
                const lineX = d.source.data.x;
                let lineY = newHeight - d.source.depth * nodeSize;
                let lineY2 = newHeight - d.target.depth * nodeSize;
                if (d.source.depth == 0) {
                    lineY2 -= getParentYOffset(d.target.data.label.text);
                } else if (d.source.depth == 1) {
                    lineY -= getParentYOffset(d.source.data.label.text);
                    lineY2 -= nodeSize;
                }
                return `
                    M${lineX},${lineY}
                    H${d.target.data.x}
                    V${lineY2}
                `;
            });

        // Create nodes.
        const node = g.append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => {
                if (d.depth === 1) {
                    return `translate(${d.data.x}, ${newHeight - d.depth * nodeSize - getParentYOffset(d.data.label.text)})`;
                } else if (d.depth === 2) {
                    return `translate(${d.data.x}, ${newHeight - (d.depth+1) * nodeSize})`;
                } else {
                    return `translate(${d.data.x}, ${newHeight - d.depth * nodeSize})`;
                }
            });

        // Append squares.
        node.append("rect")
            .attr("width", d => d.depth === 0 ? 10 : d.depth === 1 ? 7 : 5)
            .attr("height", d => d.depth === 0 ? 10 : d.depth === 1 ? 7 : 5)
            .attr("x", d => d.depth === 0 ? -5 : d.depth === 1 ? -3.5 : -2.5)
            .attr("y", d => d.depth === 0 ? -5 : d.depth === 1 ? -3.5 : -2.5)
            .attr("fill", d => d.children ? "#555" : "#999");

        // Append text labels.
        node.append("text")
            .attr("dy", d => d.depth === 2 ? -4 : 4)
            .attr("dx", d => d.depth === 2 ? 4 : -6)
            .attr("transform", d => d.depth === 2 ? "rotate(45)" : "")
            .attr("text-anchor", d => d.depth === 2 ? "start" : "end")
            .style("fill", d => {
            if (d.depth === 0) {
                return theme.palette.text.primary;
            } else if (d.depth === 1) {
                return theme.palette.text.secondary;
            } else {
                return theme.palette.text.disabled;
            }
            })
            .text(d => truncateString(d.data.label.text, 12))
            .clone(true).lower()
            .attr("stroke", "white");

    }, [targetTreeData, innerHeight, innerWidth]);

    return (
        <div>
            <svg
                width={"100%"}
                height={"100%"}
                style={{ overflow: "visible" }} 
                ref={svgRef}></svg>
        </div>
    );
};

export default IndentedTreeAxis;
