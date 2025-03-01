import React, { useEffect, useMemo } from "react";
// import { useTreeLayout } from "./tree/useTreeLayout";
import { TreeAxis } from "../tree/TreeAxis";
import { useResizedSVGRef } from "../../hooks/resize-hooks";
import { StyledText } from "../../../layout/components";
import { TreeNode, LabelPlacement } from "../tree/types";

interface HierarchicalAxisProps {
  targetTreeData: TreeNode[];
  targetLabelPlacements: LabelPlacement[];
  targetExpandedNodes: Set<string>;
  toggleTargetNode: (nodeId: string) => void;
}

const MARGIN = { top: 30, right: 70, bottom: 0, left: 200 };

const HierarchicalAxis: React.FC<HierarchicalAxisProps> = ({
  targetTreeData,
  targetLabelPlacements,
  targetExpandedNodes,
  toggleTargetNode,
}) => {
  const { svgHeight, svgWidth, ref: svgRef } = useResizedSVGRef();

  const dimensions = {
    width: svgWidth,
    height: svgHeight,
  };

  console.log("targetTreeData", targetTreeData);

  return (
    <svg
      ref={svgRef}
      width={"100%"}
      height={"100%"}
      style={{ overflow: "visible" }}
    >
      <g transform={`translate(${MARGIN.left},${0})`}>
        {/* <g transform={`translate(0,${y.range()[1]})`}> */}
        {/* <line x1={0} x2={x.range()[1]} stroke="black" /> */}
        {/* </g> */}

        <g transform={`translate(0,0)`}>
          <TreeAxis
            treeData={targetTreeData}
            labelPlacements={targetLabelPlacements}
            orientation="horizontal"
            axisLength={dimensions.width - MARGIN.left - MARGIN.right}
            expandedNodes={targetExpandedNodes}
            onToggleNode={toggleTargetNode}
          />
        </g>
      </g>

      <g>
        <StyledText
          transform={`translate(${
            (dimensions.width + MARGIN.left - MARGIN.right) / 2
          }, 180)`}
          textAnchor="middle"
          style={{ fontSize: "1em", fontWeight: "600" }}
        >
          Target Attributes
        </StyledText>
      </g>
    </svg>
  );
};

export { HierarchicalAxis };
