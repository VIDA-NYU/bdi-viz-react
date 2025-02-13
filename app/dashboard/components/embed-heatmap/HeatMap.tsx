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
import { useTreeLayout } from "./tree/useTreeLayout";
import { ClusteringOptions, TreeConfig } from "./tree/types";
import { TreeNodeComponent } from "./tree/TreeNode";
import { useLabelManagement } from "./tree/useLabelManagement";
import { TreeAxis } from "./tree/TreeAxis";
import { useResizedSVGRef } from "../hooks/resize-hooks";

interface HeatMapProps {
  data: AggregatedCandidate[];
  sourceCluster?: string[];
  selectedCandidate?: Candidate;
  setSelectedCandidate?: (candidate: Candidate | undefined) => void;
  sourceUniqueValues: SourceUniqueValues[];
  targetUniqueValues: TargetUniqueValues[];
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

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  sourceCluster,
  selectedCandidate,
  setSelectedCandidate,
  sourceUniqueValues,
  targetUniqueValues,
  sx
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const [config, setConfig] = useState<HeatMapConfig>({
    cellType: "rect",
    colorScheme: "blues",
    colorScalePadding: 10,
    maxScore: 1,
    minScore: 0,
  });

  const treeConfig: TreeConfig = {
    clusteringMethod: 'prefix',
    nodeWidth: 20,
    nodeHeight: 20,
    nodePadding: 5
  }

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
  
  
  const { tooltip, showTooltip, hideTooltip } = useTooltip();

  // Handle window resize
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (containerRef.current) {
  //       setDimensions({
  //         width: containerRef.current.clientWidth - 16,
  //         height: 400,
  //       });
  //     }
  //   };

  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  

  const handleCellClick = useCallback(
    (cellData: Candidate) => {
      if (setSelectedCandidate) {
        if (
          selectedCandidate &&
          selectedCandidate.sourceColumn === cellData.sourceColumn &&
          selectedCandidate.targetColumn === cellData.targetColumn
        ) {
          setSelectedCandidate(undefined);
        } else {
          setSelectedCandidate(cellData);
        }
      }
    },
    [setSelectedCandidate, selectedCandidate]
  );

  const CellComponent = config.cellType === "rect" ? RectCell : RectCell;
  // console.log("TFS", targetTreeData,  targetLabelPlacements);
  return (
    <Box sx={{ ...sx, paddingLeft: 0, height: "100%", width: "100%" }}>
        <svg
          ref={svgRef}
          width={"100%"}
          height={"100%"}
          style={{ overflow: "visible" }}
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {candidates
              // .filter((d) => d.matcher === selectedMatcher?.name)
              .map((d: AggregatedCandidate, i: number) => {
                let sourceUniqueValue;
                let targetUniqueValue;
                if (
                  sourceUniqueValues !== undefined &&
                  targetUniqueValues !== undefined
                ) {
                  sourceUniqueValue = sourceUniqueValues.find(
                    (s) => s.sourceColumn === d.sourceColumn
                  );
                  targetUniqueValue = targetUniqueValues.find(
                    (t) => t.targetColumn === d.targetColumn
                  );
                }
                if (
                  selectedCandidate &&
                  selectedCandidate.sourceColumn === d.sourceColumn &&
                  selectedCandidate.targetColumn === d.targetColumn
                  // && selectedCandidate.matcher === d.matcher
                ) {
                  return (
                    <BaseExpandedCell
                      type={"histogram"}
                      key={`${d.sourceColumn}-${d.targetColumn}`}
                      data={d}
                      sourceUniqueValues={
                        sourceUniqueValue ?? {
                          sourceColumn: "",
                          uniqueValues: [],
                        }
                      }
                      targetUniqueValues={
                        targetUniqueValue ?? {
                          targetColumn: "",
                          uniqueValues: [],
                        }
                      }
                      onClose={() => {
                        handleCellClick(d);
                      }}
                      width={getWidth(d)}
                      height={getHeight(d)}
                      x={x(d.targetColumn) ?? 0}
                      y={y(d.sourceColumn) ?? 0}
                      onClick={() => {
                        handleCellClick(d);
                      }}
                    />
                  );
                } else {
                  return (
                    <CellComponent
                      key={`${d.sourceColumn}-${d.targetColumn}`}
                      data={d}
                      config={config}
                      x={x(d.targetColumn) ?? 0}
                      y={y(d.sourceColumn) ?? 0}
                      width={getWidth(d)}
                      height={getHeight(d)}
                      color={color}
                      isSelected={
                        selectedCandidate?.sourceColumn === d.sourceColumn &&
                        selectedCandidate?.targetColumn === d.targetColumn
                      }
                      onHover={showTooltip}
                      onLeave={hideTooltip}
                      onClick={() => {
                        handleCellClick(d);
                      }}
                    />
                  );
                }
              })}

<g>
                <line y1={0} y2={y.range()[1]} stroke="black" />
                {y.domain().map((value) => {
                  const yPos = y(value)!;
                  const height = getHeight({ sourceColumn: value } as Candidate);
                  return (
                    <g
                      key={value}
                      transform={`translate(-5,${yPos + height / 2})`}
                    >
                      <text
                        dy=".35em"
                        textAnchor="end"
                        style={{
                          fontSize: selectedCandidate?.sourceColumn === value ? "1.2em" : "0.8em",
                          opacity:
                            selectedCandidate?.sourceColumn === value ? 1 : 0.7,
                        }}
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}
              </g>

            
            {/* <g transform={`translate(0,${dimensions.height - MARGIN.top - MARGIN.bottom})`}>
              < TreeAxis
                treeData={targetTreeData}
                labelPlacements={targetLabelPlacements}
                orientation="horizontal"
                axisLength={dimensions.width - MARGIN.left - MARGIN.right}
                expandedNodes={targetExpandedNodes}
                onToggleNode={toggleTargetNode}
              />
            </g> */}

          </g>
        </svg>
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: "white",
            padding: "8px",
            border: "1px solid black",
            borderRadius: "4px",
            pointerEvents: "none",
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </Box>
  );
};

export default HeatMap;
