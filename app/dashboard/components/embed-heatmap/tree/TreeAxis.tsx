// src/components/TreeAxis.tsx
import React from 'react';
import { TreeNode, LabelPlacement } from './types';

interface TreeBranchProps {
  node: TreeNode;
  isExpanded: boolean;
  orientation: 'vertical' | 'horizontal';
  onToggle: () => void;
}

const TreeBranch: React.FC<TreeBranchProps> = ({
    node,
    isExpanded,
    orientation,
    onToggle
  }) => {
    const isVertical = orientation === 'vertical';
    
    // console.log(isHorizontal, 'hori')
    // Calculate curve control points for parallel layout
    const getCurvePath = (start: { x: number, y: number }, end: { x: number, y: number }) => {
      if (isVertical) {
        const deltaY = end.y - start.y;
        const deltaX = end.x - start.x;
        const initialBendOffset = Math.min(Math.abs(deltaX) * 0.2, 50); // Control the initial bend
  
        return `M ${start.x} ${start.y}
                C ${start.x + initialBendOffset} ${start.y},
                  ${start.x + initialBendOffset} ${end.y},
                  ${end.x} ${end.y}`;
      } else {
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const initialBendOffset = Math.min(Math.abs(deltaY) * 0.2, 50); // Control the initial bend
  
        return `M ${start.x} ${start.y}
                C ${start.x} ${start.y + initialBendOffset},
                  ${end.x} ${start.y + initialBendOffset},
                  ${end.x} ${end.y}`;
      }
    };
    
    return (
      <g>
        <circle
          cx={node.x}
          cy={node.y}
          r={3}
          fill={node.children ? "#4a5568" : "#a0aec0"}
          cursor={node.children ? "pointer" : "default"}
          onClick={node.children ? onToggle : undefined}
        />
        
        {isExpanded && node.children?.map(child => (
          <g key={child.id}>
            <path
              d={getCurvePath(
                { x: node.x, y: node.y },
                { x: child.x, y: child.y }
              )}
              fill="none"
              stroke="#cbd5e0"
              strokeWidth={1}
            />
            <TreeBranch 
              node={child}
              isExpanded={isExpanded}
              orientation={orientation}
              onToggle={onToggle}
            />
          </g>
        ))}
  
        {node.children && (
          <g
            transform={`translate(${node.x},${node.y+2})`}
            cursor="pointer"
            onClick={onToggle}
          >
            <circle r={6} fill="white" stroke="#4a5568" strokeWidth={2} />
            <text
             x={0}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fill="#4a5568"
            >
              {isExpanded ? '-' : '+'}
            </text>
          </g>
        )}
      </g>
    );
  };


  function truncateString(str: string, maxLength: number, ellipsis: string = "..."): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}


interface TreeAxisProps {
  treeData: TreeNode[];
  labelPlacements: LabelPlacement[];
  orientation: 'vertical' | 'horizontal';
  axisLength: number;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
}

export const TreeAxis: React.FC<TreeAxisProps> = ({
  treeData,
  labelPlacements,
  orientation,
  axisLength,
  expandedNodes,
  onToggleNode
}) => {
  const isHorizontal = orientation === 'horizontal';
    // console.log(labelPlacements, 'label');
  return (
    <g>
      <line
        x1={0}
        y1={0}
        x2={isHorizontal ? axisLength : 0}
        y2={isHorizontal ? 0 : axisLength}
        stroke="#000"
        strokeWidth={1}
      />

      {treeData.map(node => (
        <TreeBranch
          key={node.id}
          node={node}
          isExpanded={expandedNodes.has(node.id)}
          orientation={orientation}
          onToggle={() => onToggleNode(node.id)}
        />
      ))}

      {labelPlacements.filter(p => p.show).map((placement, i) => (
        <g
          key={`${placement.text}-${i}`}
          transform={`translate(${placement.x},${placement.y})`}
        >
          <text
            className={`
              ${placement.isClusterLabel ? 'font-bold text-base' : 'text-sm'}
              ${isHorizontal && placement.isClusterLabel ? 'rotate-45' : ''}
              ${isHorizontal && !placement.isClusterLabel ? 'rotate-90' : ''}

            `}
            x={isHorizontal ? 8 : -8}
            y={isHorizontal ? -4 : 0}
            textAnchor={isHorizontal ? "start" : "end"}
            dominantBaseline="middle"
            fill={placement.isClusterLabel ? "#1a365d" : "#4a5568"}
          >
            {truncateString(placement.text, 18)}
          </text>
        </g>
      ))}
    </g>
  );
};