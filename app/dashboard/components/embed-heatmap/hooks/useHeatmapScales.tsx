import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { CellData } from '../cells/types';
import { HeatMapConfig } from '../types';
import { ColorScheme, getColorInterpolator } from '../utils/color';
interface ScaleParams {
    data: CellData[];
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
    matchers?: string[];
    config: HeatMapConfig;
}

interface HeatmapScale {
    matcher: string;
    x: d3.ScaleBand<string>;
    y: d3.ScaleBand<string>;
    color: d3.ScaleSequential<string, string>;
    cellWidth: number;
    cellHeight: number;
}

function getHeatmapScale(
    data: CellData[],
    matcher: string,
    matchers: string[],
    margin: { top: number; right: number; bottom: number; left: number },
    width: number,
    height: number,
    maxScore: number,
    minScore: number,
    padding: number,
    colors: ColorScheme[],
    index: number

) : HeatmapScale 
{
    const matcherData = data.filter(d => d.matcher === matcher);

            const numColumnsX = [...new Set(matcherData.map(d => d.targetColumn))].length;
            const numColumnsY = [...new Set(matcherData.map(d => d.sourceColumn))].length;

            const cellWidth = Math.min(
                (width - margin.left - margin.right) / (numColumnsX + 1),
                (height - margin.top - margin.bottom) / matchers.length
            );
            const cellHeight = cellWidth;

            const x = d3.scaleBand()
                .range([0, cellWidth * numColumnsX])
                .domain(matcherData.map(d => d.targetColumn));

            const y = d3.scaleBand()
                .range([0, cellHeight * numColumnsY])
                .domain(matcherData.map(d => d.sourceColumn));

            const color = d3.scaleSequential()
                .interpolator(getColorInterpolator(colors[index]))
                .domain([minScore - padding, maxScore + padding]);

            return {
                matcher,
                x,
                y,
                color,
                cellWidth,
                cellHeight
            };
}



const useHeatmapScales = ({ data, width, height, margin, matchers, config }: ScaleParams) => {
    return useMemo(() => {
        const minScore = d3.min(data, d => d.score) ?? 0;
        const maxScore = d3.max(data, d => d.score) ?? 1;
        const padding = ((maxScore - minScore) * config.colorScalePadding) / 100;
        const colors = config.colorSchemes;

        const scales = matchers?.map((matcher, index) => {
            return getHeatmapScale(
                data,
                matcher,
                matchers,
                margin,
                width,
                height,
                maxScore,
                minScore,
                padding,
                colors,
                index
            );
        });

        return { scales, dataRange: { min: minScore, max: maxScore, padding: padding } };
    }, [data, width, height, margin, matchers, config]);
};

export { useHeatmapScales };
