import { Selection } from 'd3';
import { ColumnData, LayoutConfig, highlightText } from './HierarchyUtils';
import * as d3 from 'd3';
import { intelligentTextSplit, shouldDisplayText, getMultiLineTextOffset } from './TextWrappingUtils.ts';
import { getOptimalCategoryColorScale } from './ColorUtils';


// Function to render the columns
export function renderColumns(
  g: Selection<SVGGElement, unknown, null, undefined>,
  columnData: ColumnData[],
  layoutConfig: LayoutConfig,
  columnsY: number,
  currentExpanding: any,
  categoryColorScale: (id: string) => string,
  globalQuery?: string,
) {
  const { theme, columnHeight, columnSpacing } = layoutConfig;
  const fontSize = 10; // Font size in pixels
  const lineHeight = 14; // Line height in pixels
  const maxLines = 3; // Maximum number of text lines
  const minCharsPerLine = 3; // Minimum characters per line to display text
  const textPadding = 12; // Padding from the left edge of the column to text

  // Create a color scale for categories
  
  // const categoryIds = [...new Set(columnData.map(c => c.category))];
  // const categoryColorScale = getOptimalCategoryColorScale(categoryIds);


  // Calculate column positions - use the original node's x position and width
  const positionedColumns = columnData.map((column) => ({
    ...column,
    x: column.originalNode.x || 0,
    y: columnsY,
    width: column.originalNode.width || 100, // Default if no width available
    height: columnHeight
  }));

  // Create column group
  const columnGroup = g.append('g')
    .attr('class', 'columns')
    .attr('transform', `translate(0, ${columnsY})`);
  
  // Add column rectangles and labels
  columnGroup.selectAll('.column')
    .data(positionedColumns)
    .enter()
    .append('g')
    .attr('class', 'column')
    .attr('id', d => `column-${d.id}`)
    .attr('transform', d => `translate(${d.x}, 0)`)
    .each(function(d) {
      const group = d3.select(this);
      const columnWidth = d.width || 100;
      
      // Main rectangle
      group.append('rect')
        .attr('width', columnWidth)
        .attr('height', columnHeight)
        .attr('rx', 3)
        .attr('fill', 'white')
        .attr('stroke', categoryColorScale(d.category))
        .attr('stroke-width', 1);
      
      // Category indicator bar
      group.append('rect')
        .attr('x', 3)
        .attr('y', 3)
        .attr('width', 5)
        .attr('height', columnHeight - 6)
        .attr('rx', 1)
        .attr('fill', categoryColorScale(d.category))
        .attr('opacity', 0.7);
      
      // Calculate available text width
      const availableTextWidth = columnWidth - (textPadding + 5);
      
      // Check if we should display text or not
      if (shouldDisplayText(availableTextWidth, fontSize, minCharsPerLine, maxLines)) {
        const { lines, isTruncated } = intelligentTextSplit(
          d.name, 
          availableTextWidth, 
          fontSize,
          maxLines
        );
        
        // Create a group for text lines
        const textGroup = group.append('g')
          .attr('class', 'column-text')
          .attr('transform', `translate(${textPadding}, ${columnHeight / 2})`);
        
        // Add each line of text
        lines.forEach((line, i) => {
          // Calculate vertical position for this line
          // Center the text block vertically
          const yOffset = i * lineHeight - getMultiLineTextOffset(lines.length, lineHeight);
          
          textGroup.append('text')
            .attr('y', yOffset)
            .attr('dy', '0.35em') // Vertical alignment
            .attr('text-anchor', 'start')
            .attr('font-family', `"Roboto","Helvetica","Arial",sans-serif`)
            .attr('font-size', `${fontSize}px`)
            .attr('fill', theme.palette.text.primary)
            .html(globalQuery ? highlightText(line, globalQuery, theme) : line);
        });
        
        // Add a tooltip for truncated text
        if (isTruncated) {
          group
            .on('mouseenter', function(event) {
              // Create tooltip
              // const tooltip = g.append('g')
              //   .attr('class', 'column-tooltip')
              //   .attr('pointer-events', 'none');
              
              // // Background rectangle
              // const tooltipBg = tooltip.append('rect')
              //   .attr('fill', 'white')
              //   .attr('stroke', theme.palette.divider)
              //   .attr('rx', 3)
              //   .attr('opacity', 0.9);
              
              // // Text element
              // const tooltipText = tooltip.append('text')
              //   .attr('x', 8)
              //   .attr('y', 14)
              //   .attr('font-family', `"Roboto","Helvetica","Arial",sans-serif`)
              //   .attr('font-size', '12px')
              //   .attr('fill', theme.palette.text.primary)
              //   .text(d.name);
              
              // // Get the text bounding box to size the rectangle
              // const textBox = (tooltipText.node() as SVGTextElement).getBBox();
              
              // // Position and size the background rectangle
              // tooltipBg
              //   .attr('width', textBox.width + 16)
              //   .attr('height', textBox.height + 12);
              
              // // Position the tooltip - above the column
              // tooltip.attr('transform', `translate(${d.x + columnWidth / 2 - (textBox.width + 16) / 2}, ${columnsY - 40})`);
            })
            .on('mouseleave', function() {
              // g.select('.column-tooltip').remove();
            });
        }
      }
    })
    .on('mouseover', function(event, d) {
      // Highlight this column
      d3.select(this)
        .select('rect')
        .attr('stroke-width', 2);
      
      // Highlight the related paths
      g.selectAll('.column-category-path')
        .filter(path => (path as any)?.column?.id === d.id)
        .attr('stroke-width', 2.5)
        .attr('stroke-opacity', 1)
        .attr('stroke-dasharray', '0');
      
      // Highlight the category
      g.select(`#category-${d.category}`)
        .select('rect')
        .attr('stroke-width', 2);
      
      // Fade other paths
      g.selectAll('.column-category-path')
        .filter(path => (path as any)?.column?.id !== d.id)
        .attr('stroke-opacity', 0.2);
        const tooltip = g.append('g')
        .attr('class', 'column-tooltip')
        .attr('pointer-events', 'none');
      
      const columnWidth = d.width || 100;
      // Background rectangle
      const tooltipBg = tooltip.append('rect')
        .attr('fill', 'white')
        .attr('stroke', theme.palette.divider)
        .attr('rx', 3)
        .attr('opacity', 0.9);
      
      // Text element
      const tooltipText = tooltip.append('text')
        .attr('x', 8)
        .attr('y', 14)
        .attr('font-family', `"Roboto","Helvetica","Arial",sans-serif`)
        .attr('font-size', '12px')
        .attr('fill', theme.palette.text.primary)
        .text(d.name);
      
      // Get the text bounding box to size the rectangle
      const textBox = (tooltipText.node() as SVGTextElement).getBBox();
      
      // Position and size the background rectangle
      tooltipBg
        .attr('width', textBox.width + 16)
        .attr('height', textBox.height + 12);
      
      // Position the tooltip - above the column
      tooltip.attr('transform', `translate(${d.x + columnWidth / 2 - (textBox.width + 16) / 2}, ${columnsY - 40})`);
    })
    .on('mouseout', function() {
      // Reset all elements
      g.selectAll('.column rect')
        .attr('stroke-width', 1);
      
      g.selectAll('.category rect')
        .attr('stroke-width', 1);
      
      g.selectAll('.column-category-path')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.7)
        .attr('stroke-dasharray', '3,3');
        g.select('.column-tooltip').remove();
    })
    .on('click', function(event, d) {
      // Dispatch event or handle column click
      if (d.originalNode && typeof d.originalNode.isExpanded !== 'undefined') {
        console.log('Column clicked:', d.name);
        // Add your click handler implementation here
      }
    });

  return {
    positionedColumns
  };
}