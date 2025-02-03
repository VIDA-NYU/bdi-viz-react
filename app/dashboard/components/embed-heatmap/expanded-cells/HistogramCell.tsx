// components/expanded-cells/HistogramCell.tsx
import React from 'react';
import * as d3 from 'd3';
import { ExpandedCellProps } from './types';
import { FC } from 'react';


const HistogramCell: FC<ExpandedCellProps> = ({
  sourceUniqueValues,
  targetUniqueValues,
  width,
  height,
}) => {

  console.log("sourceUniqueValues: ", sourceUniqueValues);
  console.log("targetUniqueValues: ", targetUniqueValues);

  // Generate fake data

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = (height - margin.top - margin.bottom) / 2;

  // Scales
  const sourceX = d3.scaleBand()
    .domain(sourceUniqueValues.uniqueValues.map(d => d.value.toString()))
    .range([0, chartWidth]);

  const targetX = d3.scaleBand()
    .domain(targetUniqueValues.uniqueValues.map(d => d.value!.toString()))
    .range([0, chartWidth]);

  const sourceY = d3.scaleLinear()
    .domain([0, sourceUniqueValues.uniqueValues.map(d => d.count).reduce((a, b) => Math.max(a, b))])
    .range([chartHeight, 0]);

  const targetY = d3.scaleLinear()
    .domain([0, targetUniqueValues.uniqueValues.map(d => d.count).reduce((a, b) => Math.max(a, b))])
    .range([chartHeight, 0]);

  return (
    <g transform={`translate(${margin.left},${margin.top})`}>
      {/* Source Histogram */}
      <g>
        <text x={chartWidth / 2} y={-5} textAnchor="middle" style={{ position: 'absolute' }}>{sourceUniqueValues.sourceColumn}</text>
        {sourceUniqueValues.uniqueValues.map((bin, i) => (
          <rect
            key={i}
            x={sourceX(bin.value!)}
            y={sourceY(bin.count)}
            width={sourceX.bandwidth()}
            height={chartHeight - sourceY(bin.count)}
            fill="#8884d8"
            opacity={0.7}
          />
        ))}
      </g>

      {/* Target Histogram */}
      <g transform={`translate(0,${chartHeight + margin.top})`}>
        <text x={chartWidth / 2} y={-5} textAnchor="middle" style={{ position: 'absolute' }}>{targetUniqueValues.targetColumn}</text>
        {targetUniqueValues.uniqueValues.map((bin, i) => (
          <rect
            key={i}
            x={targetX(bin.value!)}
            y={targetY(bin.count)}
            width={targetX.bandwidth()}
            height={chartHeight - targetY(bin.count)}
            fill="#82ca9d"
            opacity={0.7}
          />
        ))}
      </g>

      {/* Axes */}
      <g transform={`translate(0,${chartHeight})`}>
        <line x1={0} x2={chartWidth} stroke="black"/>
      </g>
      <g transform={`translate(0,${2 * chartHeight + margin.top})`}>
        <line x1={0} x2={chartWidth} stroke="black"/>
      </g>
    </g>
  );
};

export {HistogramCell};
