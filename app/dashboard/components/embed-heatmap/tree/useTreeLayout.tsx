// src/hooks/useTreeLayout.ts
import { useState, useMemo } from 'react';
import { TreeNode, Scale, ClusteringOptions } from './types';

interface UseTreeLayoutProps {
  columns: string[];
  scale: Scale;
  orientation: 'vertical' | 'horizontal';
  options: ClusteringOptions;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export const useTreeLayout = ({
  columns,
  scale,
  orientation,
  options,
  width,
  height,
  margin
}: UseTreeLayoutProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  const treeData = useMemo(() => {
    const createPrefixTree = (): TreeNode[] => {
      const prefixMap = new Map<string, string[]>();
      
      columns.forEach(col => {
        const prefix = col.split('_')[0];
        if (!prefixMap.has(prefix)) {
          prefixMap.set(prefix, []);
        }
        prefixMap.get(prefix)!.push(col);
      });

      const prefixes = Array.from(prefixMap.entries());
      const usableWidth = width - margin.left - margin.right;
      const usableHeight = height - margin.top - margin.bottom;
      
      return prefixes.map(([prefix, cols], index) => {
        // Calculate category node position evenly across available space
        const categoryPosition = orientation === 'horizontal' 
          ? (usableWidth * (index + 0.5)) / prefixes.length
          : (usableHeight * (index + 0.5)) / prefixes.length;

        return {
          id: prefix,
          label: {
            text: prefix,
            show: true,
            isClusterLabel: true
          },
          level: 1,
          children: cols.map(col => ({
            id: col,
            label: {
              text: col.substring(prefix.length + 1),
              show: true,
              isClusterLabel: false
            },
            level: 2,
            originalColumn: col,
            // Use scale for actual column positions
            x: orientation === 'horizontal' ? scale(col) ?? 0 : 0,
            y: orientation === 'vertical' ? scale(col) ?? 0 : 0,
            isExpanded: expandedNodes.has(col)
          })),
          // Use evenly distributed positions for category nodes
          x: orientation === 'horizontal' ? categoryPosition : 0,
          y: orientation === 'vertical' ? categoryPosition : (expandedNodes.size > 0 ? 120 : 40),
          isExpanded: expandedNodes.has(prefix)
        };
      });
    };

    switch (options.method) {
      case 'prefix':
        return createPrefixTree();
      case 'custom':
        return options.customClusterFn?.(columns) ?? createPrefixTree();
      default:
        return createPrefixTree();
    }
  }, [columns, scale, orientation, options, width, height, margin, expandedNodes]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getVisibleColumns = () => {
    const result: string[] = [];
    
    const traverse = (node: TreeNode) => {
      if (!node.children || !expandedNodes.has(node.id)) {
        if (node.originalColumn) {
          result.push(node.originalColumn);
        }
        return;
      }
      node.children.forEach(traverse);
    };

    treeData.forEach(traverse);
    return result;
  };

  return {
    treeData,
    expandedNodes,
    toggleNode,
    getVisibleColumns
  };
};