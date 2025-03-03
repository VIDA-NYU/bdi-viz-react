import React, { useEffect, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";
import { TreeNode } from "../tree/types";
import { useResizedSVGRef } from "../../hooks/resize-hooks";
import { StyledText } from "@/app/dashboard/layout/components";

interface IndentedTreeAxisProps {
    targetTreeData: TreeNode[];
    currentExpanding?: AggregatedCandidate;
}

const MARGIN = { top: 0, right: 70, bottom: 0, left: 200 };

const IndentedTreeAxis: React.FC<IndentedTreeAxisProps> = ({ targetTreeData, currentExpanding }) => {
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

        let grandParents: string[] = targetTreeData.map((node) => node.label.text);
        const getGrandParentYOffset = (label: string) => {
            return grandParents.indexOf(label) * 30;
        }

        // Build hierarchy and compute layout.
        // const root = d3.hierarchy(targetTreeData[0]);
        let index = 0;
        const root = d3.hierarchy({ label: { text: "root" }, children: targetTreeData } as TreeNode);
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
            .attr("transform", `translate(${MARGIN.left}, ${5})`);

        // Create links.
        const link = g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            // .data(root.links())
            .data(root.links().filter(d => d.target.data.isExpanded === true))
            .join("path")
            .attr("d", d => {
            const lineX = d.source.data.x;
            let lineY = newHeight - d.source.depth * nodeSize;
            let lineY2 = newHeight - d.target.depth * nodeSize;
            if (d.source.depth == 0) {
                
            } else if (d.source.depth == 1) {
                lineY -= getGrandParentYOffset(d.source.data.label.text);
                lineY2 -= getParentYOffset(d.target.data.label.text);
            } else if (d.source.depth == 2) {
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
            .data(root.descendants().slice(1).filter(d => d.data.isExpanded === true))
            .join("g")
            .attr("transform", d => {
            if (d.depth === 1) {
                return `translate(${d.data.x}, ${newHeight - d.depth * nodeSize - getGrandParentYOffset(d.data.label.text)})`;
            } else if (d.depth === 2) {
                return `translate(${d.data.x}, ${newHeight - d.depth * nodeSize - getParentYOffset(d.data.label.text)})`;
            } else if (d.depth === 3) {
                return `translate(${d.data.x}, ${newHeight - (d.depth+1) * nodeSize})`;
            } else {
                return `translate(${d.data.x}, ${newHeight - d.depth * nodeSize})`;
            }
            });

        // Append background card for depth === 1.
        node.filter(d => d.depth === 1)
            .append("rect")
            .attr("x", -110)
            .attr("y", -10)
            .attr("width", 120)
            .attr("height", 20)
            .attr("fill", "#f0f0f0");

        // Append squares.
        node.append("rect")
            .attr("width", d => d.depth === 1 ? 20 : d.depth === 2 ? 10 : 5)
            .attr("height", d => d.depth === 1 ? 20 : d.depth === 2 ? 10 : 5)
            .attr("x", d => d.depth === 1 ? -10 : d.depth === 2 ? -5 : -2.5)
            .attr("y", d => d.depth === 1 ? -10 : d.depth === 2 ? -5 : -2.5)
            .attr("fill", d => d.children ? "#555" : "#999");

        // Append text labels.
        node.append("text")
            .attr("dy", d => d.depth === 3 ? -4 : 4)
            .attr("dx", d => d.depth === 3 ? 4 : -10)
            .attr("transform", d => d.depth === 3 ? "rotate(45)" : "")
            .attr("text-anchor", d => d.depth === 3 ? "start" : "end")
            .attr("font-size", d => d.depth === 1 ? "1em" : d.depth === 2 ? "0.8em" : "0.8em")
            .attr("font-weight", d => d.depth === 1 ? "300" : "600")
            .attr("font-family", `"Roboto","Helvetica","Arial",sans-serif`)
            .style("fill", d => {
            if (d.depth === 1) {
                return theme.palette.text.primary;
            } else if (d.depth === 2) {
                return theme.palette.text.primary;
            } else {
                return theme.palette.grey[600];
            }
            })
            .text(d => {
                if (currentExpanding) {
                    return d.data.label.text;
                } else {
                    return truncateString(d.data.label.text, 12);
                }
            })
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