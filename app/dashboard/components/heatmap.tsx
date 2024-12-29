'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { Card } from '@mui/material';

interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
}

interface SourceCluster {
    sourceColumn: string;
    cluster: string[];
}

interface HeatMapProps {
    data: Candidate[];
    sourceClusters?: SourceCluster[];
    setSelectedCandidate?: (candidate: Candidate | undefined) => void;
    filters?: {
        selectedCandidate?: Candidate;
        sourceColumn: string;
        candidateType: string;
        similarSources: number;
        candidateThreshold: number;
    }
}

const HeatMap: React.FC<HeatMapProps> = (prop) => {
    const { data, sourceClusters, filters } = prop;
    const [candidates] = useState<Candidate[]>(data);

    const drawHeatMap = () => {
        const margin = { top: 50, right: 0, bottom: 100, left: 50 },
            width = document.getElementById('heatmap')?.clientWidth || window.innerWidth,
            height = 400 - margin.top - margin.bottom;

        d3.select("#heatmap").selectAll("*").remove();

        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Filter data based on filters
        let filteredData = data;
        
        // Filter by sourceColumn, sourceClusters, and similarSources
        if (filters?.sourceColumn) {
            const sourceCluster: SourceCluster | undefined = sourceClusters?.find(sc => sc.sourceColumn === filters.sourceColumn);
            let cluster = sourceCluster?.cluster;
            if (cluster && filters.similarSources) {
                cluster = cluster.slice(0, filters.similarSources);
            }
            if (!cluster) {
                filteredData = filteredData.filter(d => d.sourceColumn === filters.sourceColumn);
            } else {
                filteredData = filteredData.filter(d => cluster?.includes(d.sourceColumn));
                // Sort filteredData to match the order of the cluster
                filteredData.sort((a, b) => cluster.indexOf(a.sourceColumn) - cluster.indexOf(b.sourceColumn));
            }
        }

        // Filter by threshold
        if (filters?.candidateThreshold) {
            filteredData = filteredData.filter(d => d.score >= filters.candidateThreshold);
        }

        // console.log('filteredData: ', filteredData);
        
        const numColumnsX = filteredData.length > 0 ? filteredData.map(d => d.targetColumn).filter((v, i, a) => a.indexOf(v) === i).length : 1;
        const numColumnsY = filteredData.length > 0 ? filteredData.map(d => d.sourceColumn).filter((v, i, a) => a.indexOf(v) === i).length : 1;
        const cellSize = Math.min(width / (numColumnsX+1), height / numColumnsY);

        const x = d3.scaleBand().range([0, cellSize * numColumnsX]);
        const y = d3.scaleBand().range([0, cellSize * numColumnsY]);

        x.domain(filteredData.map(d => d.targetColumn));
        y.domain(filteredData.map(d => d.sourceColumn));

        // Calculate the actual min and max scores from the data
        const minScore = d3.min(filteredData, d => d.score) || 0;
        const maxScore = d3.max(filteredData, d => d.score) || 1;
        
        // Create a dynamic color scale with padding
        const color = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([minScore * 0.9, maxScore * 1.1]); // Add 10% padding

        // Add color legend
        const legendWidth = 20;
        const legendHeight = height;
        
        const legendScale = d3.scaleLinear()
            .domain([minScore, maxScore])
            .range([legendHeight, 0]);

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${cellSize * numColumnsX + 50}, 0)`);

        const legendGradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");

        legendGradient.selectAll("stop")
            .data(d3.range(0, 1.1, 0.1))
            .enter()
            .append("stop")
            .attr("offset", d => d * 100 + "%")
            .attr("stop-color", d => color(d * (maxScore - minScore) + minScore));

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        const legendAxis = d3.axisRight(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".2f"));

        legend.append("g")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px");

        svg.selectAll()
            .data(filteredData, function (d: Candidate | undefined) { return d ? d.sourceColumn + ':' + d.targetColumn : ''; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.targetColumn) ?? 0 })
            .attr("y", function (d) { return y(d.sourceColumn) ?? 0 })
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", function (d) { return color(d.score) })
            .style("stroke", "black")
            .style("stroke-width", function (d) {
                if (!filters?.selectedCandidate) {
                    return 0;
                } else {
                    return d.sourceColumn === filters.selectedCandidate.sourceColumn && 
                           d.targetColumn === filters.selectedCandidate.targetColumn ? 2 : 0;
                }
            })
            .style("fill-opacity", function (d) {
                if (!filters?.selectedCandidate) {
                    return 1;
                } else {
                    return d.sourceColumn === filters.selectedCandidate.sourceColumn && 
                           d.targetColumn === filters.selectedCandidate.targetColumn ? 1 : 0;
                }
            })
            .on("mouseover", function (event, d) {
                d3.select(this).style("stroke-width", 2);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Source: " + d.sourceColumn + "<br/>Target: " + d.targetColumn + "<br/>Score: " + d.score.toFixed(3))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).style("stroke-width", function (d) {
                    const candidate = d as Candidate;
                    return filters?.selectedCandidate && 
                           candidate.sourceColumn === filters.selectedCandidate.sourceColumn && 
                           candidate.targetColumn === filters.selectedCandidate.targetColumn ? 2 : 0;
                });
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function (_, d) {
                if (prop.setSelectedCandidate) {
                    if (filters?.selectedCandidate && 
                        filters.selectedCandidate.sourceColumn === d.sourceColumn && 
                        filters.selectedCandidate.targetColumn === d.targetColumn) {
                        prop.setSelectedCandidate(undefined);
                    } else {
                        prop.setSelectedCandidate(d);
                    }
                }
                tooltip.remove();
            });

        // Add axes
        svg.append("g")
            .attr("transform", "translate(0," + cellSize * numColumnsY + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .call(d3.axisLeft(y));
    };

    useEffect(() => {
        drawHeatMap();
        window.addEventListener('resize', drawHeatMap);
        return () => window.removeEventListener('resize', drawHeatMap);
    }, [candidates, filters]);

    return (
        <Card sx={{ mt: 6 }}>
            <div id="heatmap"></div>
        </Card>
    )
}

export default HeatMap;