import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Box } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
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
import * as d3 from 'd3';

interface HeatMapProps {
  data: AggregatedCandidate[];
  sourceCluster?: string[];
  selectedCandidate?: Candidate;
  setSelectedCandidate?: (candidate: Candidate | undefined) => void;
  sourceUniqueValues: SourceUniqueValues[];
  targetUniqueValues: TargetUniqueValues[];
  highlightSourceColumns: Array<string>;
  highlightTargetColumns: Array<string>;
  sx?: Record<string, any>;
}

const defaultClusteringOptions: ClusteringOptions = {
  method: 'prefix',
  showClusterLabels: true,
  labelSpacing: 40,
  maxLabelsPerView: 30,
  labelPlacementStrategy: 'fixed'
};

const MARGIN = { top: 0, right: 78, bottom: 0, left: 200 };

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  sourceCluster,
  selectedCandidate,
  setSelectedCandidate,
  sourceUniqueValues,
  targetUniqueValues,
  highlightSourceColumns,
  highlightTargetColumns,
  sx
}) => {
  
  const theme = useTheme();
  const StyledText = styled('text')({
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
  });

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

  const colorRamp = color
                  .domain([0, 1]);

  const legendWidth = 100;
  const legendHeight = 15;

  const legendData = d3.range(legendWidth).map((d) => d / legendWidth);

  const CellComponent = config.cellType === "rect" ? RectCell : RectCell;
  // console.log("TFS", targetTreeData,  targetLabelPlacements);
  return (
    <Box sx={{
      ...sx,
      paddingLeft: 0,
      height: "100%",
      width: "100%",
      // backgroundColor: theme.palette.grey[100],
    }}>
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
                      isHighlighted={
                        highlightSourceColumns.includes(d.sourceColumn) ||
                        highlightTargetColumns.includes(d.targetColumn)
                      }
                    />
                  );
                }
              })}
              
              <g>
                
                {/* Color Legend */}
                <rect
                  transform="translate(-170, 0)"
                  style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}
                  width={legendWidth + 20}
                  height={legendHeight + 40}
                  fill={theme.palette.grey[200]}
                  rx={2} ry={2}
                />
                <g transform={`translate(-160, 15)`}>
                  <StyledText
                    x={0}
                    y={0}
                    textAnchor="start"
                    style={{
                      fontSize: "0.8em",
                      fontWeight: "400"
                    }}
                  >
                    Color Legend
                  </StyledText>
                  <g transform={`translate(0, 5)`}>
                    {legendData.map((d, i) => (
                      <rect
                        key={i}
                        x={i}
                        y={0}
                        width={1}
                        height={legendHeight}
                        fill={colorRamp(d)}
                      />
                    ))}
                    <StyledText x={0} y={legendHeight + 15} textAnchor="middle" style={{ fontSize: "0.8em" }}>
                      0
                    </StyledText>
                    <StyledText x={legendWidth} y={legendHeight + 15} textAnchor="middle" style={{ fontSize: "0.8em" }}>
                      1
                    </StyledText>
                  </g>
                </g>

                
                <g>
                  <StyledText
                    transform={`translate(-80, ${(y.range()[1] / 2) + 10}) rotate(-90)`}
                    textAnchor="middle"
                    style={{ fontSize: "1em", fontWeight: "600" }}
                  >
                    Source Attributes
                  </StyledText>
                </g>
                <line y1={0} y2={y.range()[1]} stroke={theme.palette.grey[500]} strokeWidth={2} />
                {y.domain().map((value) => {
                  const yPos = y(value)!;
                  const height = getHeight({ sourceColumn: value } as Candidate);
                  return (
                  <g
                    key={value}
                    transform={`translate(-5,${yPos + height / 2})`}
                  >
                    <StyledText
                    dy=".35em"
                    textAnchor="end"
                    transform="rotate(45)"
                    style={{
                      fill: theme.palette.grey[600],
                      fontSize: selectedCandidate?.sourceColumn === value ? "1.2em" : "0.8em",
                      fontWeight: 600,
                    }}
                    >
                    {value}
                    </StyledText>
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
