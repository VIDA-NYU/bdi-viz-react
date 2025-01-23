// hooks/useHeatmapScales.ts
import { useMemo } from 'react';
import * as d3 from 'd3';
import { CellData } from '../cells/types';
import { HeatMapConfig } from '../types';
import { ColorScheme, getColorInterpolator, getColorScale } from '../utils/color';

interface ScaleParams {
    data: CellData[];
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
    config: HeatMapConfig;
}

const useHeatmapScales = ({ data, width, height, margin, config }: ScaleParams) => {
    return useMemo(() => {
        // @ts-ignore
        const numColumnsX = [...new Set(data.map(d => d.targetColumn))].length;
        // @ts-ignore
        const numColumnsY = [...new Set(data.map(d => d.sourceColumn))].length;
        
        const cellWidth = Math.min(
            (width - margin.left - margin.right) / (numColumnsX + 1),
            (height - margin.top - margin.bottom) / numColumnsY
        );
        const cellHeight = cellWidth;

        const x = d3.scaleBand()
            .range([0, cellWidth * numColumnsX])
            .domain(data.map(d => d.targetColumn));

        const y = d3.scaleBand()
            .range([0, cellHeight * numColumnsY])
            .domain(data.map(d => d.sourceColumn));
        // console.log(data, 'ss')
        const minScore =  d3.min(data, d => d.score) ?? 0;
        const maxScore =  d3.max(data, d => d.score) ?? 1;
        const padding = ((maxScore - minScore) * config.colorScalePadding) / 100;
        // console.log(minScore, maxScore, padding, 'ss')
        const color = d3.scaleSequential()
            .interpolator(getColorInterpolator(config.colorScheme))
            .domain([minScore - padding, maxScore + padding]);

        return {
            x,
            y,
            color,
            cellWidth,
            cellHeight,
            dataRange: { min: minScore, max: maxScore }
        };
    }, [data, width, height, margin, config]);
};

export {useHeatmapScales};