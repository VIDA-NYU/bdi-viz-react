import React, { useEffect, useMemo, useState } from 'react';
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

interface ExpandedState {
    expandedCell: CellData | null;
    position: { x: number; y: number } | null;
  }

interface HeatmapScale {
    matcher: string;
    x: d3.ScaleBand<string> ;
    y: d3.ScaleBand<string> ;
    getWidth: (column: string) => number;
    getHeight: (column: string) => number;
    color: d3.ScaleSequential<string, string>;
    expandedState: ExpandedState;
    handleExpand: (cell: CellData) => void;
    handleCollapse: () => void;
    dataRange: { min: number; max: number };
    // cellWidth: number;
    // cellHeight: number;
}


function generateCustomScaleBand(
    data: CellData[],
    getPosition: (column: string) => number,
    domain: string[],
    range: [number, number]
   ): d3.ScaleBand<string> {
    const originalScale = d3.scaleBand()
      .domain(domain)
      .range(range)
      .padding(0.1);
   
    const customScale = ((column: string) => getPosition(column)) as d3.ScaleBand<string>;
    
    Object.keys(originalScale).forEach(key => {
      (customScale as any)[key] = (originalScale as any)[key];
    });
   
    return customScale;
   }

function getHeatmapScale(
    data: CellData[],
    expandedState: ExpandedState,
    setExpandedState: React.Dispatch<React.SetStateAction<ExpandedState>>,
    matcher: string,
    matchers: string[],
    margin: { top: number; right: number; bottom: number; left: number },
    width: number,
    height: number,
    maxScore: number,
    minScore: number,
    padding: number,
    colors: ColorScheme[],
    index: number,
    expandedCell: CellData | null = null,
    expandRatio: number =  3,
    colorScheme: ColorScheme = 'viridis'

) : HeatmapScale 
{   
    const matcherData = data.filter(d => d.matcher === matcher);

    const numColumnsX = [...new Set(matcherData.map(d => d.targetColumn))].length;
    const numColumnsY = [...new Set(matcherData.map(d => d.sourceColumn))].length;
    

    const baseCellWidth = Math.min(
                (width - margin.left - margin.right) / (numColumnsX + 1),
                (height - margin.top - margin.bottom) / matchers.length
            );
    const baseCellHeight = baseCellWidth;

    const yColumns = [...new Set(data.map(d => d.sourceColumn))]
    
    const totalWidth = baseCellWidth * numColumnsX;
    const totalHeight = baseCellHeight * numColumnsY;
    
    // const expandRatioX = 3;
    // const expandRatioY = ;
        
          // Dynamic cell sizing
    
    const expandedWidth = baseCellWidth * expandRatio;
    const expandedHeight = baseCellHeight * expandRatio;
        
    // const shrunkWidth = 
    const shrunkWidth = (totalWidth - expandedWidth) / (numColumnsX - 1);

    const shrunkHeight = (totalHeight - expandedHeight) / (numColumnsY - 1);

          // Scale functions with expansion logic
    const getWidth = (column: string) => {
        if (!expandedState.expandedCell) return baseCellWidth;
        if (column === expandedState.expandedCell.targetColumn) return expandedWidth;
        return shrunkWidth
    };
  
    const getHeight = (column: string) => {
        if (!expandedState.expandedCell) return baseCellHeight;
        if (column === expandedState.expandedCell.sourceColumn) return expandedHeight;
        return shrunkHeight;
    };
          


    // Similar getXPosition and getYPosition functions but using respective shrink ratios
    const getXPosition = (column: string) => {
        const index = data.findIndex(d => d.targetColumn === column);
        const expandedIndex = expandedState.expandedCell ? 
                data.findIndex(d => d.targetColumn === expandedState.expandedCell?.targetColumn) : -1;

        if (!expandedState.expandedCell) return baseCellWidth * index;
        if (index === expandedIndex) return shrunkWidth * index;
        if (index < expandedIndex) return shrunkWidth * index;
        if (index === expandedIndex + 1) return shrunkWidth * index + expandedWidth;
        return shrunkWidth * expandedIndex + expandedWidth + shrunkWidth * (index - expandedIndex - 1);
    };

    const getYPosition = (column: string) => {
            const index = yColumns.findIndex(d => d === column);
            const expandedIndex = expandedState.expandedCell ? 
                yColumns.findIndex(d => d === expandedState.expandedCell?.sourceColumn) : -1;
            if (!expandedState.expandedCell) return baseCellHeight * index;
            if (index < expandedIndex) return shrunkHeight * index;
            if (index === expandedIndex) return shrunkHeight * index;
            if (index === expandedIndex + 1) return shrunkHeight * index + expandedHeight;
            return shrunkHeight * expandedIndex + expandedHeight + shrunkHeight * (index - expandedIndex - 1);
    };

    const x = generateCustomScaleBand(data, getXPosition, [...new Set(data.map(d => d.targetColumn))], [0, width - margin.left - margin.right]);
    // const x = (column: string) => getXPosition(column);
    // x.domain = () => [...new Set(data.map(d => d.targetColumn))];
    // x.range = () => [0, width - margin.left - margin.right];
        
    const y = generateCustomScaleBand(data, getYPosition, [...new Set(data.map(d => d.sourceColumn))], [0, height - margin.top - margin.bottom]);
    // const y = (column: string) => getYPosition(column);
    // y.domain = () => [...new Set(data.map(d => d.sourceColumn))];
    // y.range = () => [0, height - margin.top - margin.bottom];

        //   const y = d3.scalePoint()
        //       .range([0, height - margin.top - margin.bottom])
        //       .domain(data.map(d => d.sourceColumn))
        //       .padding(0.1);
  
          // Color scale remains unchanged
          const color = d3.scaleSequential()
              .interpolator(getColorInterpolator(colorScheme))
              .domain([minScore - padding, maxScore + padding]);
  
          const handleExpand = (cell: CellData) => {
              setExpandedState({
                  expandedCell: cell,
                  position: { 
                      x: x(cell.targetColumn) || 0, 
                      y: y(cell.sourceColumn) || 0 
                  }
              });
          };
  
          return {
              x,
              y,
              matcher,
              color,
              getWidth,
              getHeight,
              expandedState,
              handleExpand,
              handleCollapse: () => setExpandedState({ expandedCell: null, position: null }),
              dataRange: { min: minScore, max: maxScore }
          };
    
            // const color = d3.scaleSequential()
            //     .interpolator(getColorInterpolator(colors[index]))
            //     .domain([minScore - padding, maxScore + padding]);

            
}



const useHeatmapScales = ({ data, width, height, margin, matchers, config }: ScaleParams) => {

    const [expandedStates, setExpandedStates] = useState<Array<ExpandedState>>(matchers?.map(() => ({ expandedCell: null, position: null })) ?? []);
    const [cachedMatchers, setCachedMatchers] = useState<string[]>(matchers ?? []);

    useEffect(() => {
        if(matchers?.length !== expandedStates.length){
            setExpandedStates(matchers?.map(() => ({ expandedCell: null, position: null })) ?? []);
            setCachedMatchers(matchers ?? []);
        }
    }, [matchers]);



    return useMemo(() => {
        const minScore = d3.min(data, d => d.score) ?? 0;
        const maxScore = d3.max(data, d => d.score) ?? 1;
        const padding = ((maxScore - minScore) * config.colorScalePadding) / 100;
        const colors = config.colorSchemes;

        const scales = cachedMatchers?.map((matcher, index) => {
            const setExpandedState : React.Dispatch<React.SetStateAction<ExpandedState>> = (value) => {
                if(typeof value === 'function'){
                    setExpandedStates((prev) => {
                        const newState = [...prev];
                        newState[index] = value(prev[index]);
                        return newState;
                    });
                } else {
                    setExpandedStates((prev) => {
                        const newState = [...prev];
                        newState[index] = value;
                        return newState;
                    });
                }
            }
            return getHeatmapScale(
                data,
                expandedStates[index],
                setExpandedState,
                matcher,
                cachedMatchers,
                margin,
                width,
                height,
                maxScore,
                minScore,
                padding,
                colors,
                index
            );
        }) ?? [];


        return { scales, dataRange: { min: minScore, max: maxScore, padding: padding } };
    }, [data, width, height, margin, cachedMatchers, config]);
};

export { useHeatmapScales };
