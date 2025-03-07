import { Selection } from 'd3';
import { CategoryData, ColumnData, LayoutConfig, SuperCategoryData, highlightText } from './HierarchyUtils.tsx';
import * as d3 from 'd3';
import { getOptimalCategoryColorScale } from './ColorUtils.ts';
import { applyDefaultStyleOnColumn, applyDefaultStyleOnEdge, applyBackgroundStyleOnColumn, applyBackgroundStyleOnEdge, applyHighlightOnColumn, applyHighlightStyleOnEdge } from './InteractionUtils.ts';


// Function to calculate segment positions for categories
// Function to calculate segment positions for categories
export function calculateCategorySegments(
  categoryData: CategoryData[],
  layoutConfig: LayoutConfig,
  columnsPositioned: boolean,
  columnPositions?: { id: string; x: number; width: number; }[]
): CategoryData[] {
  const { innerWidth } = layoutConfig;
  const MIN_CATEGORY_WIDTH = 80; // Minimum width for category to ensure text fits
  
  // First, sort categories based on their leftmost column position
  const sortedCategories = [...categoryData].sort((a, b) => {
    if (!columnsPositioned || !columnPositions) return 0;
    
    // Find leftmost column for each category
    const aColumnIds = a.columns.map(col => col.id);
    const bColumnIds = b.columns.map(col => col.id);
    
    const aPositions = columnPositions.filter(pos => aColumnIds.includes(pos.id));
    const bPositions = columnPositions.filter(pos => bColumnIds.includes(pos.id));
    
    if (aPositions.length === 0 || bPositions.length === 0) return 0;
    
    const aLeftmost = Math.min(...aPositions.map(pos => pos.x));
    const bLeftmost = Math.min(...bPositions.map(pos => pos.x));
    
    return aLeftmost - bLeftmost;
  });
  
  // Create a result array to hold the calculated positions
  const result: CategoryData[] = [];
  
  if (columnsPositioned && columnPositions) {
    // Calculate based on column positions
    for (const category of sortedCategories) {
      const updatedCategory = { ...category };
      
      // Get columns for this category
      const categoryColumns = category.columns;
      if (categoryColumns.length > 0) {
        const columnIds = categoryColumns.map(col => col.id);
        const relevantPositions = columnPositions.filter(pos => columnIds.includes(pos.id));
        
        if (relevantPositions.length > 0) {
          // Find actual span based on column positions
          const leftmost = Math.min(...relevantPositions.map(pos => pos.x));
          const rightmost = Math.max(...relevantPositions.map(pos => pos.x + pos.width));
          
          updatedCategory.x = leftmost;
          updatedCategory.width = Math.max(rightmost - leftmost, MIN_CATEGORY_WIDTH);
          updatedCategory.centerX = leftmost + (updatedCategory.width / 2);
        }
      }
      
      result.push(updatedCategory);
    }
  } else {
    // If columns aren't positioned yet, distribute categories evenly
    const totalCategories = sortedCategories.length;
    // const availableWidth = innerWidth - (MIN_CATEGORY_WIDTH * totalCategories);
    
    // Calculate percentage width based on column count with minimum width consideration
    const totalColumns = sortedCategories.reduce((sum, cat) => sum + cat.columns.length, 0);

    const widthThreshold = MIN_CATEGORY_WIDTH / innerWidth;
    const numCategoriesBelowThreshold = sortedCategories.filter(cat => {
      const proportion = cat.columns.length / totalColumns;
      return proportion < widthThreshold;
    }
    ).length;

    // const availableWidth = innerWidth - (MIN_CATEGORY_WIDTH * numCategoriesBelowThreshold);
    const availableWidth = innerWidth - (MIN_CATEGORY_WIDTH * totalCategories) - ((totalCategories - 1) * layoutConfig.segmentSpacing);

    const numColumnsInCategoriesAboveThreshold = sortedCategories.filter(cat => {
      const proportion = cat.columns.length / totalColumns;
      return proportion >= widthThreshold;
    }
    ).reduce((sum, cat) => sum + cat.columns.length, 0);

    
    sortedCategories.forEach((category, i) => {
      const updatedCategory = { ...category };
      
      // Calculate proportional width (with minimum)
      const proportionOfColumns = category.columns.length / totalColumns;
      // const calculatedWidth = Math.max(
      //   proportionOfColumns * availableWidth + MIN_CATEGORY_WIDTH,
      //   MIN_CATEGORY_WIDTH
      // );
      
      // if(proportionOfColumns < widthThreshold) {
      //   const calculatedWidth = MIN_CATEGORY_WIDTH;
      // }else{
      //   const calculatedWidth = category.columns.length * availableWidth / numColumnsInCategoriesAboveThreshold;
      // }
      const calculatedWidth = proportionOfColumns < widthThreshold ? MIN_CATEGORY_WIDTH : MIN_CATEGORY_WIDTH + category.columns.length * availableWidth / numColumnsInCategoriesAboveThreshold;

      // For positioning, we need to know how much width was used before this category
      const precedingCategories = sortedCategories.slice(0, i);
      const precedingWidth = precedingCategories.reduce((sum, cat) => {
        const catProportion = cat.columns.length / totalColumns;
        return sum + (catProportion < widthThreshold ? MIN_CATEGORY_WIDTH : MIN_CATEGORY_WIDTH + cat.columns.length * availableWidth / numColumnsInCategoriesAboveThreshold) + layoutConfig.segmentSpacing;

      }, 0);
      
      updatedCategory.x = precedingWidth;
      updatedCategory.width = calculatedWidth;
      updatedCategory.centerX = updatedCategory.x + (calculatedWidth / 2);
      
      result.push(updatedCategory);
    });
  }
  
  return result;
}


// Function to calculate segment positions for super categories
export function calculateSuperCategorySegments(
  superCategoryData: SuperCategoryData[],
  categorySegments: CategoryData[]
): SuperCategoryData[] {
  return superCategoryData.map(superCategory => {
    const updatedSuperCategory = { ...superCategory };
    const relevantCategories = categorySegments.filter(
      cat => cat.superCategory === superCategory.id
    );
    
    if (relevantCategories.length > 0) {
      const leftmost = Math.min(...relevantCategories.map(cat => cat.x || 0));
      const rightmost = Math.max(...relevantCategories.map(cat => (cat.x || 0) + (cat.width || 0)));
      
      updatedSuperCategory.x = leftmost;
      updatedSuperCategory.width = rightmost - leftmost;
      updatedSuperCategory.centerX = leftmost + (rightmost - leftmost) / 2;
    }
    
    return updatedSuperCategory;
  });
}

// Function to render the space-filling segments
export function renderSpaceFillingSegments(
  g: Selection<SVGGElement, unknown, null, undefined>,
  columnData: ColumnData[],
  superCategoryData: SuperCategoryData[],
  categoryData: CategoryData[],
  layoutConfig: LayoutConfig,
  superCategoryY: number,
  categoryY: number,
  categoryColorScale: (id: string) => string
) {
  const { theme, globalQuery } = layoutConfig;
  // const categoryIds = [...new Set(categoryData.map(c => c.id))];
  // const categoryColorScale = getOptimalCategoryColorScale(categoryIds);
  
  // Create a color scale for super categories
  const superCategoryIds = [...new Set(superCategoryData.map(sc => sc.id))];
  const superCategoryColorScale = getOptimalCategoryColorScale(superCategoryIds);

  

  // Position the segments
  const hierarchyHeight = layoutConfig.hierarchyHeight;
  const positionedCategorySegments = calculateCategorySegments(categoryData, layoutConfig, false);
  const positionedSuperCategorySegments = calculateSuperCategorySegments(superCategoryData, positionedCategorySegments);

  // Create super category segments
  const superCategoryGroup = g.append('g')
    .attr('class', 'super-categories');
  
  superCategoryGroup.selectAll('.super-category')
    .data(positionedSuperCategorySegments)
    .enter()
    .append('g')
    .attr('class', 'super-category')
    .attr('id', d => `super-category-${d.id}`)
    .attr('transform', d => `translate(${d.x}, ${superCategoryY})`)
    .each(function(d:any) {
      const group = d3.select(this);
      
      // Segment rectangle
      group.append('rect')
        .attr('width', d.width)
        .attr('height', hierarchyHeight)
        .attr('rx', 3)
        .attr('fill', superCategoryColorScale(d.id))
        .attr('stroke', theme.palette.text.primary)
        .attr('stroke-width', 1);
      
      // Label text
      group.append('text')
        .attr('x', d.width! / 2)
        .attr('y', hierarchyHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', theme.palette.common.white)
        .attr('font-family', `"Roboto","Helvetica","Arial",sans-serif`)
        .attr('font-size', '0.9rem')
        .attr('font-weight', '500')
        .html(highlightText(d.id, globalQuery, theme));
      }).on('mouseover', function(event, d: SuperCategoryData) {
        // Highlight this path
        d3.select(this)
          .attr('stroke-width', 2.5)
          .attr('stroke-opacity', 1)
          .attr('stroke-dasharray', '0');
          superCategoryData.filter(sc => sc.id !== d.id).forEach(sc => {
            g.select(`#super-category-${sc.id}`)
            .attr('opacity', 0.2)
            .select('rect')
            .attr('stroke-width', 1);
          });
        

        // Highlight the connected categories
        categoryData.filter(category => category.superCategory === d.id).forEach(category => {
          g.select(`#category-${category.id}`)
          .attr('opacity', 1)
          .select('rect')
          .attr('stroke-width', 2);

          g.select(`category-super-connection-${category.id}-${d.id}`).call(applyHighlightStyleOnEdge);
        });
        
        // Make the unconnected categories transparent
        categoryData.filter(category => category.superCategory !== d.id).forEach(category => {
          g.select(`#category-${category.id}`)
          .attr('opacity', 0.2)
          .select('rect')
          .attr('stroke-width', 1);

          g.select(`category-super-connection-${category.id}-${d.id}`).call(applyBackgroundStyleOnEdge);
          
        });

        columnData.filter(column => categoryData.filter(category => category.superCategory === d.id).map(cat => cat.columns.map(col => col.id)).flat().includes(column.id)).forEach(column => {
          g.select(`#column-${column.id}`).call(applyHighlightOnColumn);
          // .attr('opacity', 1)
          // .select('rect')
          // .attr('stroke-width', 2); 
          
          g.select(`#edge-${column.id}-${column.category}`).call(applyHighlightStyleOnEdge);
          // .attr('stroke-width', 1.5)
          // .attr('stroke-opacity', 1)
          // .attr('stroke-dasharray', '3,3'); 
        }
        );

        columnData.filter(column => categoryData.filter(category => category.superCategory !== d.id).map(cat => cat.columns.map(col => col.id)).flat().includes(column.id)).forEach(column => { 
          g.select(`#column-${column.id}`).call(applyBackgroundStyleOnColumn);
          // .attr('opacity', 0.2)
          // .select('rect')
          // .attr('stroke-width', 1);
          
          g.select(`#edge-${column.id}-${column.category}`).call(applyBackgroundStyleOnEdge);
          // .attr('stroke-width', 1.5)
          // .attr('stroke-opacity', 0.2)
          // .attr('stroke-dasharray', '3,3'); 
        });


      }).on('mouseout', function(event, d: SuperCategoryData) {
        // Reset all elements
        g.selectAll('.category')
          .attr('opacity', 1)
          .select('rect')
          .attr('stroke-width', 1);
        
        g.selectAll('.super-category')
          .attr('opacity', 1)
          .select('rect')
          .attr('stroke-width', 1);

        columnData.forEach(column => {
          g.select(`#column-${column.id}`).call(applyHighlightOnColumn);
          // .attr('opacity', 1)
          // .select('rect')
          // .attr('stroke-width', 1); 
          
          g.select(`#edge-${column.id}-${column.category}`).call(applyHighlightStyleOnEdge);

          g.select('.category-super-connection').call(applyDefaultStyleOnEdge);
          // .attr('stroke-width', 1.5)
          // .attr('stroke-opacity', 0.7)
          // .attr('stroke-dasharray', '3,3'); 
        }
        );
      });

  // Create category segments
  const categoryGroup = g.append('g')
    .attr('class', 'categories');
  categoryGroup.selectAll('.category')
    .data(positionedCategorySegments)
    .enter()
    .append('g')
    .attr('class', 'category')
    .attr('id', d => `category-${d.id}`)
    .attr('transform', d => `translate(${d.x}, ${categoryY})`)
    .each(function(d: any) {
      const group = d3.select(this);
      
      // Segment rectangle
      group.append('rect')
        .attr('width', d.width)
        .attr('height', hierarchyHeight)
        .attr('rx', 2)
        .attr('fill', categoryColorScale(d.id))
        .attr('stroke', theme.palette.text.primary)
        .attr('stroke-width', 1);
      
      // Label text
      group.append('text')
        .attr('x', d.width! / 2)
        .attr('y', hierarchyHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', theme.palette.common.white)
        .attr('font-family', `"Roboto","Helvetica","Arial",sans-serif`)
        .attr('font-size', '0.8rem')
        .html(highlightText(d.id, globalQuery, theme));
    }).on('mouseover', function(event, d: CategoryData) {
      // Highlight this path
      d3.select(this)
        .attr('stroke-width', 2.5)
        .attr('stroke-opacity', 1)
        .attr('stroke-dasharray', '0');
      
        // Highlight the connected columns
        columnData.filter(column => d.columns.map(col => col.id).includes(column.id)).forEach(column => {
            g.select(`#column-${column.id}`)
            // .call(applyHighlightOnColumn);
            .attr('opacity', 1)
            .select('rect')
            .attr('stroke-width', 2); 
            
            g.select(`#edge-${column.id}-${d.id}`)
            // .call(applyHighlightStyleOnEdge);
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 1)
            .attr('stroke-dasharray', '3,3'); 
          }
        );

        // Make the unconnected columns transparent
        columnData.filter(column => !d.columns.map(col => col.id).includes(column.id)).forEach(column => {
          g.select(`#column-${column.id}`)
          // .call(applyBackgroundStyleOnColumn);
            .attr('opacity', 0.2)
            .select('rect')
            .attr('stroke-width', 1);
          g.select(`#edge-${column.id}-${column.category}`)
          // .call(applyBackgroundStyleOnEdge);
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', '3,3'); 
          }
        );

        

      // Highlight the connected column and category
      // g.select(`#column-${d.column.id}`)
      //   .attr('opacity', 1)
      //   .select('rect')
      //   .attr('stroke-width', 2);
      
      g.select(`#category-${d.id}`)
        .attr('opacity', 1)
        .select('rect')
        .attr('stroke-width', 2);
      

      // Fade other paths
      // pathGroup.selectAll('.column-category-path')
      //   .filter((path:any) => path.id !== d.id)
      //   .attr('stroke-opacity', 0.2);
    })
    .on('mouseout', function(event, d: CategoryData) {
      // Reset all elements
      // pathGroup.selectAll('.column-category-path')
      //   .attr('stroke-width', 1.5)
      //   .attr('stroke-opacity', 0.7)
      //   .attr('stroke-dasharray', '3,3');
      
      // g.selectAll('.column')
      //   .attr('opacity', 1)
      //   .select('rect')
      //   .attr('stroke-width', 1);
      
      g.selectAll('.category')
        .attr('opacity', 1)
        .select('rect')
        .attr('stroke-width', 1);
      
        columnData.filter(column => d.columns.map(col => col.id).includes(column.id)).forEach(column => {
          g.select(`#column-${column.id}`).call(applyHighlightOnColumn);
            // .attr('opacity', 1)
            // .select('rect')
            // .attr('stroke-width', 1); 
          
          g.select(`#edge-${column.id}-${d.id}`).call(applyHighlightStyleOnEdge);
            // .attr('stroke-width', 1.5)
            // .attr('stroke-opacity', 0.7)
            // .attr('stroke-dasharray', '3,3');
          
        }
        );
        columnData.filter(column => !d.columns.map(col => col.id).includes(column.id)).forEach(column => {
          g.select(`#column-${column.id}`).call(applyDefaultStyleOnColumn);
            // .attr('opacity', 1)
            // .select('rect')
            // .attr('stroke-width', 1);
          g.select(`#edge-${column.id}-${column.category}`).call(applyDefaultStyleOnEdge);
            // .attr('stroke-width', 1.5)
            // .attr('stroke-opacity', 0.7)
            // .attr('stroke-dasharray', '3,3');
        }
        );


    });


  // Create connecting lines from categories to super categories
  positionedCategorySegments.forEach(category => {
    const superCategory = positionedSuperCategorySegments.find(sc => sc.id === category.superCategory);
    if (!superCategory || !category.centerX || !superCategory.centerX) return;
    
    g.append('path')
      .attr('id', `category-super-connection-${category.id}-${superCategory.id}`)
      .attr('class', 'category-super-connection')
      .attr('d', `
        M ${category.centerX} ${categoryY + hierarchyHeight}
        C ${category.centerX} ${categoryY + hierarchyHeight + 10},
          ${superCategory.centerX} ${superCategoryY  - 10},
          ${superCategory.centerX} ${superCategoryY}
      `)
      .attr('fill', 'none')
      .attr('stroke', categoryColorScale(category.id))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.7);
  });

  return {
    positionedCategorySegments,
    positionedSuperCategorySegments,
    categoryColorScale
  };
}