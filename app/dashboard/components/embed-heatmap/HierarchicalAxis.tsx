import React, {
    useRef,
    useEffect,
    useState,
    useMemo,
    useCallback,
  } from "react";
  import { Box } from "@mui/material";
  import { RectCell } from "./cells/RectCell";
  import { useHeatmapScales } from "./hooks/useHeatmapScales";
  import { useTooltip } from "./hooks/useTooltip";
  import { BaseExpandedCell } from "./expanded-cells/BaseExpandedCell";
  import { HeatMapConfig } from "./types";
  // import { useTreeLayout } from "./tree/useTreeLayout";
  import { useOntologyLayout } from "./tree/useOntologyLayout";
  import { ClusteringOptions, TreeConfig } from "./tree/types";
  import { TreeNodeComponent } from "./tree/TreeNode";
  import { useLabelManagement } from "./tree/useLabelManagement";
  import { TreeAxis } from "./tree/TreeAxis";
  import { useResizedSVGRef } from "../hooks/resize-hooks";
  
  interface HierarchicalAxisProps {
    data: AggregatedCandidate[];
    sourceCluster?: string[];
    targetOntologies?: TargetOntology[];
    selectedCandidate?: Candidate;
    sx?: Record<string, any>;
  }
  
  const defaultClusteringOptions: ClusteringOptions = {
    method: 'prefix',
    showClusterLabels: true,
    labelSpacing: 40,
    maxLabelsPerView: 30,
    labelPlacementStrategy: 'fixed'
  };
  
  const MARGIN = { top: 30, right: 70, bottom: 0, left: 200 };
  
  const HierarchicalAxis: React.FC<HierarchicalAxisProps> = ({
    data,
    sourceCluster,
    targetOntologies,
    selectedCandidate,
    sx
  }) => {
    // const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
    const [config, setConfig] = useState<HeatMapConfig>({
      cellType: "rect",
      colorScheme: "blues",
      colorScalePadding: 10,
      maxScore: 1,
      minScore: 0,
    });
    const candidates = useMemo(() => {
      // return data.filter((d) => d.matcher === selectedMatcher?.name).sort((a, b) => {
      //   if (a.sourceColumn === b.sourceColumn) {
      //     // compare by alphabet
      //     return a.targetColumn < b.targetColumn ? -1 : 1;
      //     // return a.targetColumn.localeCompare(b.targetColumn);
      //   }
      //   return a.sourceColumn < b.sourceColumn ? -1 : 1;
      // });
      return data;
    }, [data]);
      
    const {
      svgHeight, svgWidth, ref: svgRef
    } = useResizedSVGRef();
  
    const dimensions = {
      width: svgWidth,
      height: svgHeight
    };
    const { x, y, color, getWidth, getHeight, dataRange } = useHeatmapScales({
      data: candidates,
      sourceCluster: sourceCluster,
      width: dimensions.width,
      height: dimensions.height,
      margin: MARGIN,
      config,
      selectedCandidate: selectedCandidate,
    });
    const clusteringOptions = defaultClusteringOptions;
    // const {
    //   treeData: targetTreeData,
    //   expandedNodes: targetExpandedNodes,
    //   toggleNode: toggleTargetNode,
    //   getVisibleColumns: getVisibleTargetColumns
    // } = useTreeLayout({
    //   width: dimensions.width,
    //   height: dimensions.height,
    //   margin: MARGIN,
    //   columns: x.domain(),
    //   scale: x,
    //   getWidth: getWidth,
    //   options: clusteringOptions,
    //   orientation: 'horizontal'
    // });

    const {
      treeData: targetTreeData,
      expandedNodes: targetExpandedNodes,
      toggleNode: toggleTargetNode,
      getVisibleColumns: getVisibleTargetColumns
    } = useOntologyLayout({
      columns: x.domain(),
      targetOntologies: targetOntologies ?? [],
      width: dimensions.width,
      height: dimensions.height,
      margin: MARGIN,
      scale: x,
      getWidth: getWidth,
    })
    
    
    const targetLabelPlacements = useLabelManagement({
      nodes: targetTreeData,
      scale: x,
      orientation: 'horizontal',
      viewportWidth: dimensions.width - MARGIN.left - MARGIN.right,
      options: clusteringOptions,
      expandedNodes: targetExpandedNodes
    });
  
  
    return (
      <Box sx={{ ...sx, paddingLeft: 0, }}>
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
                < TreeAxis
                  treeData={targetTreeData}
                  labelPlacements={targetLabelPlacements}
                  orientation="horizontal"
                  axisLength={dimensions.width - MARGIN.left - MARGIN.right}
                  expandedNodes={targetExpandedNodes}
                  onToggleNode={toggleTargetNode}
                />
              </g>
  
            </g>
          </svg>
      </Box>
    );
  };
  
  export default HierarchicalAxis;
  