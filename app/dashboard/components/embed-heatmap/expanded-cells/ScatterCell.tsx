// components/expanded-cells/HistogramCell.tsx
import React from 'react';
import * as d3 from 'd3';
import { ExpandedCellProps } from './types';
import { FC } from 'react';


const ScatterCell: FC<ExpandedCellProps> = ({
    sourceColumn,
    targetColumn,
    width,
    height,
   }) => {
    // Generate fake data points
    const data = Array.from({ length: 100 }, () => ({
      source: Math.random() * 10,
      target: Math.random() * 10,
      density: Math.random() // For coloring
    }));
   
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
   
    const x = d3.scaleLinear()
      .domain([0, 10])
      .range([0, chartWidth]);
   
    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([chartHeight, 0]);
   
    const color = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolateViridis);
   
    return (
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Axes */}
        <g transform={`translate(0,${chartHeight})`}>
          <line x1={0} x2={chartWidth} stroke="black"/>
          <text x={chartWidth/2} y={30} textAnchor="middle">{sourceColumn}</text>
        </g>
        <g>
          <line y1={0} y2={chartHeight} stroke="black"/>
          <text 
            transform={`translate(-30,${chartHeight/2}) rotate(-90)`}
            textAnchor="middle"
          >
            {targetColumn}
          </text>
        </g>
   
        {/* Points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(d.source)}
            cy={y(d.target)}
            r={4}
            fill={color(d.density)}
            opacity={0.7}
          />
        ))}
      </g>
    );
   };

   export {ScatterCell}