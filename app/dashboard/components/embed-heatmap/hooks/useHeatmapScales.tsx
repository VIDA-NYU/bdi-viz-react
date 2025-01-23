// hooks/useHeatmapScales.ts
import { useMemo, useState } from 'react';
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

interface ExpandedState {
    expandedCell: CellData | null;
    position: { x: number; y: number } | null;
  }
  
  const useHeatmapScales = ({ data, width, height, margin, config }: ScaleParams) => {
      const [expandedState, setExpandedState] = useState<ExpandedState>({ 
          expandedCell: null, 
          position: null 
      });
      
  
      return useMemo(() => {
          const numColumnsX = [...new Set(data.map(d => d.targetColumn))].length;
          const numColumnsY = [...new Set(data.map(d => d.sourceColumn))].length;
          const yColumns = [...new Set(data.map(d => d.sourceColumn))]
          const totalWidth = width - margin.left - margin.right;
         const totalHeight = height - margin.top - margin.bottom;
          const expandRatioX = 3;
          const expandRatioY = 1.2;
          
        
          // Dynamic cell sizing
          const baseWidth = (width - margin.left - margin.right) / numColumnsX;
          const baseHeight = (height - margin.top - margin.bottom) / numColumnsY;
          const expandedWidth = baseWidth * expandRatioX;
          const expandedHeight = baseHeight * expandRatioY;
          
        const shrunkWidth = (totalWidth - (totalWidth/numColumnsX * expandRatioX)) / (numColumnsX - 1);

        const shrunkHeight = (totalHeight - (totalHeight/numColumnsY * expandRatioY)) / (numColumnsY - 1);

          // Scale functions with expansion logic
        const getWidth = (cell: CellData) => {
              if (!expandedState.expandedCell) return baseWidth;
              if (cell === expandedState.expandedCell) return baseWidth * expandRatioX 
              return shrunkWidth
          };
  
          const getHeight = (cell: CellData) => {
              if (!expandedState.expandedCell) return baseHeight;
              if (cell === expandedState.expandedCell) return baseHeight * expandRatioY;
              return shrunkHeight;
          };
          

          // Modified scales with expansion
        


        // Similar getXPosition and getYPosition functions but using respective shrink ratios
        const getXPosition = (column: string) => {
            const index = data.findIndex(d => d.targetColumn === column);
            const expandedIndex = expandedState.expandedCell ? 
                data.findIndex(d => d.targetColumn === expandedState.expandedCell?.targetColumn) : -1;

            if (!expandedState.expandedCell) return baseWidth * index;
            if (index === expandedIndex) return shrunkWidth * index;
            if (index < expandedIndex) return shrunkWidth * index;
            if (index === expandedIndex + 1) return shrunkWidth * index + expandedWidth;
            return shrunkWidth * expandedIndex + expandedWidth + shrunkWidth * (index - expandedIndex - 1);
        };

        const xColumns = data.map(d => d.targetColumn);
        const uniqueXColumns = [...new Set(xColumns)];
         
        const getYPosition = (column: string) => {
            const index = yColumns.findIndex(d => d === column);
            const expandedIndex = expandedState.expandedCell ? 
                data.findIndex(d => d.sourceColumn === expandedState.expandedCell?.sourceColumn) : -1;
            console.log('test e', expandedIndex, column, data, index, shrunkHeight * index,  );
            if (!expandedState.expandedCell) return baseHeight * index;
            if (index < expandedIndex) return shrunkHeight * index;
            if (index === expandedIndex) return shrunkHeight * index;
            if (index === expandedIndex + 1) return shrunkHeight * index + expandedHeight;
            return shrunkHeight * expandedIndex + expandedHeight + shrunkHeight * (index - expandedIndex - 1);
         };

         
        const x = (column: string) => getXPosition(column);
        x.domain = () => [...new Set(data.map(d => d.targetColumn))];
        x.range = () => [0, width - margin.left - margin.right];
        
        const y = (column: string) => getYPosition(column);
        y.domain = () => [...new Set(data.map(d => d.sourceColumn))];
        y.range = () => [0, height - margin.top - margin.bottom];

        //   const y = d3.scalePoint()
        //       .range([0, height - margin.top - margin.bottom])
        //       .domain(data.map(d => d.sourceColumn))
        //       .padding(0.1);
  
          // Color scale remains unchanged
          const minScore = d3.min(data, d => d.score) ?? 0;
          const maxScore = d3.max(data, d => d.score) ?? 1;
          const padding = ((maxScore - minScore) * config.colorScalePadding) / 100;
          const color = d3.scaleSequential()
              .interpolator(getColorInterpolator(config.colorScheme))
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
              color,
              getWidth,
              getHeight,
              expandedState,
              handleExpand,
              handleCollapse: () => setExpandedState({ expandedCell: null, position: null }),
              dataRange: { min: minScore, max: maxScore }
          };
      }, [data, width, height, margin, config, expandedState]);
  };
  

  export { useHeatmapScales };