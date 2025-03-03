// src/components/TreeAxis.tsx
import React from 'react';
import { TreeNode, LabelPlacement } from './types';
import { useTheme, styled } from '@mui/material';

interface TreeBranchProps {
  node: TreeNode;
  isExpanded: boolean;
  orientation: 'vertical' | 'horizontal';
  onToggle: (nodeId: string) => void;
  layer: number
}

const TreeBranch: React.FC<TreeBranchProps> = ({
    node,
    isExpanded,
    orientation,
    onToggle,
    layer
  }) => {
    const isVertical = orientation === 'vertical';
    
    // console.log(isHorizontal, 'hori')
    // Calculate curve control points for parallel layout
    const getCurvePath = (start: { x: number, y: number }, end: { x: number, y: number }, layer: number = 1) => {
      if (layer === 1) {
        if (isVertical) {
          // Calculate a very small bend radius for the corner
          const bendRadius = Math.min(Math.abs(end.x - start.x) * 0.05, 10);
          
          // For vertical paths, go straight down most of the way, then curve at the very end
          return `M ${start.x} ${start.y}
                  L ${start.x} ${end.y - bendRadius}
                  Q ${start.x} ${end.y}, ${start.x + bendRadius} ${end.y}
                  L ${end.x} ${end.y}`;
        } else {
          // Calculate a very small bend radius for the corner
          const bendRadius = Math.min(Math.abs(end.y - start.y) * 0.1, 10);
          
          // For horizontal paths, go straight across most of the way, then curve at the very end
          return `M ${start.x} ${start.y}
                  L ${end.x - bendRadius} ${start.y}
                  Q ${end.x} ${start.y}, ${end.x} ${start.y - bendRadius}
                  L ${end.x} ${end.y}`;
        }
      }
      if (isVertical) {
        const deltaY = end.y - start.y;
        const deltaX = end.x - start.x;
        const initialBendOffset = Math.min(Math.abs(deltaX) * 0.2, 50); // Control the initial bend
        // console.log("VV", isVertical)
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
          onClick={node.children ? () => onToggle(node.id) : undefined}
        />
        
        {isExpanded && node.children?.map(child => (
          <g key={child.id}>
            <path
              d={getCurvePath(
                { x: node.x, y: node.y },
                { x: child.x, y: child.y },
                layer
              )}
              fill="none"
              stroke="#cbd5e0"
              strokeWidth={2}
            />
            <TreeBranch 
              node={child}
              isExpanded={child.isExpanded ?? isExpanded}
              orientation={orientation}
              onToggle={() => onToggle(child.id)}
              layer={layer + 1}
            />
          </g>
        ))}

      
  
        {node.children && (
          <g
            transform={`translate(${node.x},${node.y+2})`}
            cursor="pointer"
            onClick={() => onToggle(node.id)}
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

  const theme = useTheme();
  const StyledText = styled('text')({
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
  });

  return (
    <g>
      <line
        x1={-1}
        y1={0}
        x2={isHorizontal ? axisLength : 0}
        y2={isHorizontal ? 0 : axisLength}
        stroke={theme.palette.grey[500]}
        strokeWidth={2}
      />

      {treeData.map((node, index) => (
        <TreeBranch
          key={`${node.id}-${index}`}
          node={node}
          isExpanded={node.isExpanded ?? false}
          orientation={orientation}
          onToggle={onToggleNode}
          layer={1}
        />
      ))}

      {labelPlacements.filter(p => p.show).map((placement, i) => (
        <g
          key={`${placement.text}-${i}`}
          transform={`translate(${placement.x},${placement.y})`}
        >
          <StyledText
            className={`
              ${isHorizontal && placement.isClusterLabel ? 'rotate-45' : ''}
              ${isHorizontal && !placement.isClusterLabel ? 'rotate-45' : ''}
            `}
            x={isHorizontal ? 8 : -8}
            y={isHorizontal ? -4 : 0}
            textAnchor={isHorizontal ? "start" : "end"}
            dominantBaseline="middle"
            fontWeight={placement.isClusterLabel ? 600 : 600}
            fontSize={placement.isClusterLabel ? '0.9rem' : '0.8rem'}
            fill={placement.isClusterLabel ? "#1a365d" : theme.palette.grey[600]}
          >
            {truncateString(placement.text, 18)}
          </StyledText>
        </g>
      ))}
    </g>
  );
};