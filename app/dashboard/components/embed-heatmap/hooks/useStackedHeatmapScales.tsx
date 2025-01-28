import { useMemo } from 'react';
import * as d3 from 'd3';
import { CellData } from '../cells/types';
import { StackedHeatMapConfig } from '../types';
import { getColorInterpolator } from '../utils/color';

interface StackedScaleParams {
    data: CellData[];
    sourceCluster?: string[];
    matchers?: string[];
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
    config: StackedHeatMapConfig;
    selectedCandidate?: CellData;
}

const useStackedHeatmapScales = ({
    data,
    sourceCluster,
    matchers,
    width,
    height,
    margin,
    config,
    selectedCandidate
}: StackedScaleParams) => {
    return useMemo(() => {
        
        const minScore = d3.min(data, d => d.score) ?? 0;
        const maxScore = d3.max(data, d => d.score) ?? 1;
        const padding = ((maxScore - minScore) * config.colorScalePadding) / 100;
        const colors = config.colorSchemes;


        const matchersGapHeight = 10;

        const numColumnsX = [...new Set(data.map(d => d.targetColumn))].length;
        const numColumnsY = sourceCluster?.length ?? [...new Set(data.map(d => d.sourceColumn))].length;
        const yColumns = sourceCluster ?? [...new Set(data.map(d => d.sourceColumn))];
        const xColumns = [...new Set(data.map(d => d.targetColumn))];

        const baseWidth = (width - margin.left - margin.right) / numColumnsX;
        const baseHeight = (height - margin.top - margin.bottom) / numColumnsY;
        const expandedWidth = Math.min(baseWidth * 3, width - margin.left - margin.right);
        const expandedHeight = Math.min(baseHeight * 1.5, height - margin.top - margin.bottom);

        const shrunkWidth = numColumnsX > 1 ? (width - margin.left - margin.right - expandedWidth) / (numColumnsX - 1) : 0;
        const shrunkHeight = numColumnsY > 1 ? (height - margin.top - margin.bottom - expandedHeight) / (numColumnsY - 1) : 0;

        const getWidth = (cell: CellData) => {
            if (!selectedCandidate) return baseWidth;
            if (cell.targetColumn === selectedCandidate.targetColumn) {
                return expandedWidth;
            }
            return shrunkWidth;
        };

        const getHeight = (cell: CellData) => {
            if (!selectedCandidate) return baseHeight;
            if (cell.sourceColumn === selectedCandidate.sourceColumn) return expandedHeight;
            return shrunkHeight;
        };
        

        const scales = matchers?.map((matcher, index) => {

            const getXPosition = (cell: CellData) => {
                const index = xColumns.findIndex(d => d === cell.targetColumn);
                const expandedIndex = selectedCandidate ? xColumns.findIndex(d => d === selectedCandidate.targetColumn) : -1;

                if (!selectedCandidate) return baseWidth * index;
                if (index <= expandedIndex) return shrunkWidth * index;
                return shrunkWidth * (index - 1) + expandedWidth;
            };

            const getYPosition = (cell: CellData) => {
                const index = yColumns.findIndex(d => d === cell.sourceColumn);
                const expandedIndex = selectedCandidate ? yColumns.findIndex(d => d === selectedCandidate.sourceColumn) : -1;
                if (!selectedCandidate) return baseHeight * index;
                if (index <= expandedIndex) return shrunkHeight * index;
                return shrunkHeight * (index - 1) + expandedHeight;
            };

            const x = (cell: CellData) => getXPosition(cell);
            x.domain = () => [...new Set(xColumns)];
            x.range = () => [0, width - margin.left - margin.right];

            const y = (cell: CellData) => getYPosition(cell);
            y.domain = () => [...new Set(yColumns)];
            y.range = () => [0, height - margin.top - margin.bottom];


            const color = d3.scaleSequential()
                .interpolator(getColorInterpolator(colors[index]))
                .domain([minScore - padding, maxScore + padding]);

            return {
                matcher,
                x,
                y,
                color
            };
        });

        return {
            scales,
            getWidth,
            getHeight,
            padding,
            dataRange: { min: minScore, max: maxScore }
        };
    }, [data, width, height, margin, config, selectedCandidate, sourceCluster, matchers]);
};

export { useStackedHeatmapScales };
