import {BaseType, Selection} from 'd3';


export function applyHighlightStyleOnEdge(selection: Selection<BaseType, unknown, null, undefined>) {
    return selection.attr('stroke-width', 1.5)
            .attr('stroke-opacity', 1)
            .attr('stroke-dasharray', '3,3'); 
}

export function applyHighlightOnColumn(selection: Selection<BaseType, unknown, null, undefined>) {
    return selection.attr('opacity', 1)
    .select('rect')
    .attr('stroke-width', 2); 
}

export function applyBackgroundStyleOnColumn(selection: Selection<BaseType, unknown, null, undefined>) {
    return selection.attr('opacity', 0.2)
    .select('rect')
    .attr('stroke-width', 1); 
}

export function applyBackgroundStyleOnEdge(selection: Selection<BaseType, unknown, null, undefined>) {
    return selection.attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.2)
    .attr('stroke-dasharray', '3,3');
}

export function applyDefaultStyleOnColumn(selection: Selection<BaseType, unknown, null, undefined>) {
    return selection.attr('opacity', 1)
    .select('rect')
    .attr('stroke-width', 1); 
}

export function applyDefaultStyleOnEdge(selection: Selection<BaseType, unknown, null, undefined>) {
    return selection.attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.7)
    .attr('stroke-dasharray', '3,3'); 
}