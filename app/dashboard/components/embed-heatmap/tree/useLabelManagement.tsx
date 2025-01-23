// src/hooks/useLabelManagement.ts
import { useMemo } from 'react';
import { TreeNode, LabelPlacement, ClusteringOptions, Scale } from './types';

interface UseLabelManagementProps {
  nodes: TreeNode[];
  scale: Scale;
  orientation: 'vertical' | 'horizontal';
  viewportWidth: number;
  options: ClusteringOptions;
  expandedNodes: Set<string>;
}

export const useLabelManagement = ({
  nodes,
  scale,
  orientation,
  viewportWidth,
  options,
  expandedNodes

}: UseLabelManagementProps) => {
    console.log(nodes, scale, orientation, viewportWidth, options, 'ss');
    const labelPlacements = useMemo(() => {
        const placements: LabelPlacement[] = [];
        const spacing = options.labelSpacing || 40;
        const maxLabels = options.maxLabelsPerView || 30;
        
        const wouldOverlap = (x: number, existingPlacements: LabelPlacement[]) => {
          return existingPlacements.some(p => 
            Math.abs(p.x - x) < spacing && p.show
          );
        };
    
        // Process nodes recursively
        const processNode = (node: TreeNode) => {
          // Add the current node's label
          placements.push({
            x: node.x,
            y: node.y,
            show: node.label.isClusterLabel || node.label.show || false,
            text: node.label.text,
            isClusterLabel: node.label.isClusterLabel || false
          });
    
          // Process children if node is expanded
          if (node.children && expandedNodes.has(node.id)) {    
            node.children.forEach(processNode);
          }
        };
    
        // Process all root nodes
        nodes.forEach(processNode);
    
        // Apply dynamic spacing if needed
        if (options.labelPlacementStrategy === 'dynamic') {
          const visiblePlacements = placements.filter(p => p.show);
          visiblePlacements.sort((a, b) => a.x - b.x);
          
          let lastX = -Infinity;
          visiblePlacements.forEach((placement) => {
            if (lastX !== -Infinity) {
              const gap = placement.x - lastX;
              if (gap < spacing) {
                placement.x += (spacing - gap);
              }
            }
            lastX = placement.x;
          });
        }
    
        return placements;
      }, [nodes, scale, orientation, viewportWidth, options]);
    console.log(labelPlacements, 'label');
     return labelPlacements;
};