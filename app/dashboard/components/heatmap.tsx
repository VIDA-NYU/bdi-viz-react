'use client';

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { Card } from '@mui/material';

interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
}

interface HeatMapProps {
    data: Candidate[];
    filters?: {
        sourceColumn: string;
        candidateType: string;
        similarSources: number;
        candidateThreshold: number;
    }
}

const HeatMap: React.FC<HeatMapProps> = (prop) => {

    const { data, filters } = prop;
    const [candidates] = useState<Candidate[]>(data);
    
    // const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);


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

        const filteredData = filters?.sourceColumn ? data.filter(d => d.sourceColumn === filters.sourceColumn) : data;

        console.log('filteredData: ', filteredData);

        const numColumnsX = filteredData.length > 0 ? filteredData.map(d => d.targetColumn).filter((v, i, a) => a.indexOf(v) === i).length : 1;
        const numColumnsY = filteredData.length > 0 ? filteredData.map(d => d.sourceColumn).filter((v, i, a) => a.indexOf(v) === i).length : 1;
        const cellSize = Math.min(width / (numColumnsX+1), height / numColumnsY);

        const x = d3.scaleBand().range([0, cellSize * numColumnsX]);
        const y = d3.scaleBand().range([0, cellSize * numColumnsY]);

        x.domain(filteredData.map(d => d.targetColumn));
        y.domain(filteredData.map(d => d.sourceColumn));

        const color = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, 1]);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px");
        
        // d3.select("body").on("click", function (event) {
        //     if (!d3.select(event.target).classed("tooltip")) {
        //     d3.selectAll("rect")
        //         .style("stroke-width", 0)
        //         .style("fill-opacity", 1);
        //     }
        // });

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
            .style("stroke-width", 0)
            .on("mouseover", function (event, d) {
            d3.select(this).style("stroke-width", 2);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Source: " + d.sourceColumn + "<br/>Target: " + d.targetColumn + "<br/>Score: " + d.score)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
            d3.select(this).style("stroke-width", 0);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            })
            .on("click", function () {
                d3.selectAll("rect")
                    .style("stroke-width", 0)
                    .style("fill-opacity", 0.0);
                d3.select(this)
                    .style("stroke-width", 2)
                    .style("fill-opacity", 1);
            });

        svg.append("g")
            .attr("transform", "translate(0," + cellSize * numColumnsY + ")")
            .call(d3.axisBottom(x));

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