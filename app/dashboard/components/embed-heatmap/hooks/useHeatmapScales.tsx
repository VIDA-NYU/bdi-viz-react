import { useMemo } from 'react';
import * as d3 from 'd3';
import { CellData } from '../cells/types';
import { HeatMapConfig } from '../types';
import { getColorInterpolator } from '../utils/color';

interface ScaleParams {
    data: CellData[];
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
    matchers?: string[];
    config: HeatMapConfig;
}

const useHeatmapScales = ({ data, width, height, margin, matchers, config }: ScaleParams) => {
    return useMemo(() => {
        const minScore = d3.min(data, d => d.score) ?? 0;
        const maxScore = d3.max(data, d => d.score) ?? 1;
        const padding = ((maxScore - minScore) * config.colorScalePadding) / 100;

        const scales = matchers?.map((matcher) => {
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
                .interpolator(getColorInterpolator(config.colorScheme))
                .domain([minScore - padding, maxScore + padding]);

            return {
                matcher,
                x,
                y,
                color,
                cellWidth,
                cellHeight
            };
        });

        return { scales, dataRange: { min: minScore, max: maxScore, padding: padding } };
    }, [data, width, height, margin, matchers, config]);
};

export { useHeatmapScales };
