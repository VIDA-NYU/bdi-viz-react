// components/expanded-cells/HistogramCell.tsx
import React from 'react';
import * as d3 from 'd3';
import { ExpandedCellProps } from './types';
import { FC } from 'react';
import { useTheme, styled } from '@mui/material';

const HistogramCell: FC<ExpandedCellProps> = ({
  sourceUniqueValues,
  targetUniqueValues,
  width,
  height,
}) => {

  const theme = useTheme();
  const StyledText = styled('text')({
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
  });

  const Label = styled('text')({
    position: 'absolute',
    backgroundColor: theme.palette.grey[800],
    boxShadow: theme.shadows[1],
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '400',
    fontSize: '0.8rem',
    zIndex: 999,
  });

  const margin = { top: 16, right: 0, bottom: 0, left: 0 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = (height - margin.top - margin.bottom) / 2;

  const sourceX = d3.scaleBand()
    .domain(sourceUniqueValues.uniqueValues.map(d => d.value.toString()).sort())
    .range([0, chartWidth]);

  const targetX = d3.scaleBand()
    .domain(targetUniqueValues.uniqueValues.map(d => d.value!.toString()).sort())
    .range([0, chartWidth]);

  const sourceY = d3.scaleLinear()
    .domain([0, sourceUniqueValues.uniqueValues.length > 0 ? sourceUniqueValues.uniqueValues.map(d => d.count).reduce((a, b) => Math.max(a, b)) : 0])
    .range([chartHeight, 0]);

  const targetY = d3.scaleLinear()
    .domain([0, targetUniqueValues.uniqueValues.length > 0 ? targetUniqueValues.uniqueValues.map(d => d.count).reduce((a, b) => Math.max(a, b)) : 0])
    .range([chartHeight, 0]);

  return (
      <svg width={width} height={height}>
        <Label x={chartWidth - 3} y={12} textAnchor="end" >{sourceUniqueValues.sourceColumn}</Label>
        <Label x={chartWidth - 3} y={chartHeight+margin.top+12} textAnchor="end" >{targetUniqueValues.targetColumn}</Label>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Source Histogram */}
          <g>
            {sourceUniqueValues.uniqueValues.map((bin, i) => (
              <g key={i}>
                <rect
                  x={sourceX(bin.value!)}
                  y={sourceY(bin.count)}
                  width={sourceX.bandwidth()}
                  height={chartHeight - sourceY(bin.count)}
                  fill={theme.palette.secondary.dark}
                  opacity={0.7}
                />
                <StyledText
                  x={sourceX(bin.value!)! + sourceX.bandwidth() / 2}
                  y={sourceY(bin.count) + 12}
                  textAnchor="middle"
                  fontSize="0.6rem"
                  fontWeight={600}
                  fontStyle={'italic'}
                  fill={theme.palette.common.white}
                >
                  {bin.value}
                </StyledText>
              </g>
            ))}
          </g>

          {/* Target Histogram */}
          <g transform={`translate(0,${chartHeight + margin.top})`}>
            {targetUniqueValues.uniqueValues.map((bin, i) => (
              <g key={i}>
                <rect
                  x={targetX(bin.value!)}
                  y={targetY(bin.count)}
                  width={targetX.bandwidth()}
                  height={chartHeight - targetY(bin.count)}
                  fill={theme.palette.primary.dark}
                  opacity={0.7}
                />
                <StyledText
                  x={targetX(bin.value!)! + targetX.bandwidth() / 2}
                  y={targetY(bin.count) + 12}
                  textAnchor="middle"
                  fontSize="0.6rem"
                  fontWeight={600}
                  fontStyle={'italic'}
                  fill={theme.palette.common.white}
                >
                  {bin.value}
                </StyledText>
              </g>
            ))}
          </g>

          {/* Axes */}
          <g transform={`translate(0,${chartHeight})`}>
            <line x1={0} x2={chartWidth} stroke={theme.palette.grey[500]} strokeWidth={1} />
          </g>
        </g>
      </svg>
  );
};

export { HistogramCell };
