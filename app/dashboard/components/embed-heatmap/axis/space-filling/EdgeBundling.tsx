import { Selection } from 'd3';
import { CategoryData, ColumnData, LayoutConfig } from './HierarchyUtils';
import * as d3 from 'd3';
import { calculateCategorySegments } from './SpaceFillingSegments';
import { getOptimalCategoryColorScale } from './ColorUtils';


// Interface for bundled path data
interface BundledPath {
  id: string;
  path: string;
  column: ColumnData;
  category: CategoryData;
}

// Create the bundled paths from columns to categories
function createBundledPaths(
  positionedColumns: ColumnData[],
  positionedCategories: CategoryData[],
  columnsY: number,
  categoryY: number,
  layoutConfig: LayoutConfig
): BundledPath[] {
  const { hierarchyHeight, columnHeight } = layoutConfig;
  const controlPointOffsetY = (columnsY - categoryY) * 0.5;
  
  return positionedColumns.map(column => {
    const category = positionedCategories.find(c => c.id === column.category);
    if (!category || !category.centerX) return null;
    
    const startX = column.x! + column.width! / 2;
    const startY = column.y! + columnHeight;
    const endX = category.centerX;
    const endY = categoryY;
    
    // Create bundled path with S-curve to give bundling effect
    return {
      id: `edge-${column.id}-${category.id}`,
      column,
      category,
      path: `
        M ${startX} ${startY}
        C ${startX} ${startY - controlPointOffsetY * 0.3},
          ${endX} ${endY + controlPointOffsetY * 0.7},
          ${endX} ${endY}
      `
    };
  }).filter(Boolean) as BundledPath[];
}

// Main function to render the edge bundling
export function renderEdgeBundling(
  g: Selection<SVGGElement, unknown, null, undefined>,
  columnData: ColumnData[],
  categoryData: CategoryData[],
  layoutConfig: LayoutConfig,
  columnsY: number,
  categoryY: number,
  categoryColorScale: (id: string) => string
) {
  // Position columns and categories
  
  const positionedColumns = columnData.map((column) => ({
    ...column,
    x: column.originalNode.x || 0,
    y: columnsY,
    width: column.originalNode.width || 100, // Default if no width available
    height: layoutConfig.columnHeight
  }));
  // const positionedCategories = categoryData.map(category => {
  //   const categoryColumns = positionedColumns.filter(col => col.category === category.id);
  //   if (categoryColumns.length === 0) return category;
    
  //   const leftmost = Math.min(...categoryColumns.map(col => col.x!));
  //   const rightmost = Math.max(...categoryColumns.map(col => col.x! + col.width!));
  //   return {
  //     ...category,
  //     x: leftmost,
  //     width: rightmost - leftmost,
  //     centerX: leftmost + (rightmost - leftmost) / 2
  //   };
  // });
  const positionedCategories = calculateCategorySegments(categoryData, layoutConfig, false);

  // Create paths
  const bundledPaths = createBundledPaths(
    positionedColumns,
    positionedCategories,
    columnsY,
    categoryY,
    layoutConfig
  );

  // Create a color scale for categories
  // const categoryIds = positionedCategories.map(c => c.id);
  // const categoryColorScale = getOptimalCategoryColorScale(
  //   categoryIds
  // )

  // Render the bundled paths
  const pathGroup = g.append('g')
    .attr('class', 'bundled-paths');
  
  pathGroup.selectAll('.column-category-path')
    .data(bundledPaths)
    .enter()
    .append('path')
    .attr('class', 'column-category-path')
    .attr('id', d => d.id)
    .attr('d', d => d.path)
    .attr('fill', 'none')
    .attr('stroke', d => categoryColorScale(d.category.id))
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.7)
    .attr('stroke-dasharray', '3,3');

  // Add interactivity to the paths
  pathGroup.selectAll('.column-category-path')
    .on('mouseover', function(event, d: any) {
      // Highlight this path
      d3.select(this)
        .attr('stroke-width', 2.5)
        .attr('stroke-opacity', 1)
        .attr('stroke-dasharray', '0');
      
      // Highlight the connected column and category
      g.select(`#column-${d.column.id}`)
        .attr('opacity', 1)
        .select('rect')
        .attr('stroke-width', 2);
      
      g.select(`#category-${d.category.id}`)
        .attr('opacity', 1)
        .select('rect')
        .attr('stroke-width', 2);

      // Fade other paths
      pathGroup.selectAll('.column-category-path')
        .filter((path:any) => path.id !== d.id)
        .attr('stroke-opacity', 0.2);
    })
    .on('mouseout', function() {
      // Reset all elements
      pathGroup.selectAll('.column-category-path')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.7)
        .attr('stroke-dasharray', '3,3');
      
      g.selectAll('.column')
        .attr('opacity', 1)
        .select('rect')
        .attr('stroke-width', 1);
      
      g.selectAll('.category')
        .attr('opacity', 1)
        .select('rect')
        .attr('stroke-width', 1);
    });

  return {
    positionedColumns,
    positionedCategories,
    bundledPaths
  };
}