// components/expanded-cells/HistogramCell.tsx
import React from 'react';
import * as d3 from 'd3';
import { ExpandedCellProps } from './types';
import { FC } from 'react';


const HistogramCell: FC<ExpandedCellProps> = ({
  sourceColumn,
  targetColumn,
  width,
  height,
}) => {
  // Generate fake data
  const sourceData = Array.from({length: 100}, () => Math.random());
  const targetData = Array.from({length: 100}, () => Math.random() * 2);

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = (height - margin.top - margin.bottom) / 2;

  // Create histogram function
  const histogram = d3.histogram()
    .domain([0, 2])
    .thresholds(20);

  // Generate bins
  const sourceBins = histogram(sourceData);
  const targetBins = histogram(targetData);

  // Scales
  const x = d3.scaleLinear()
    .domain([0, 2])
    .range([0, chartWidth]);

  const sourceY = d3.scaleLinear()
    .domain([0, d3.max(sourceBins, d => d.length) || 0])
    .range([chartHeight, 0]);

  const targetY = d3.scaleLinear()
    .domain([0, d3.max(targetBins, d => d.length) || 0])
    .range([chartHeight, 0]);

  return (
    <g transform={`translate(${margin.left},${margin.top})`}>
      {/* Source Histogram */}
      <g>
        <text x={chartWidth / 2} y={-5} textAnchor="middle" style={{ position: 'absolute' }}>{sourceColumn}</text>
        {sourceBins.map((bin, i) => (
          <rect
            key={i}
            x={x(bin.x0!)}
            y={sourceY(bin.length)}
            width={x(bin.x1!) - x(bin.x0!)}
            height={chartHeight - sourceY(bin.length)}
            fill="#8884d8"
            opacity={0.7}
          />
        ))}
      </g>

      {/* Target Histogram */}
      <g transform={`translate(0,${chartHeight + margin.top})`}>
        <text x={chartWidth / 2} y={-5} textAnchor="middle" style={{ position: 'absolute' }}>{targetColumn}</text>
        {targetBins.map((bin, i) => (
          <rect
            key={i}
            x={x(bin.x0!)}
            y={targetY(bin.length)}
            width={x(bin.x1!) - x(bin.x0!)}
            height={chartHeight - targetY(bin.length)}
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
