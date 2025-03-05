import { BaseExpandedCellProps, ExpandedCellProps, ExpandedCellType } from "./types";
import {HistogramCell} from './HistogramCell';
import { FC } from "react";
import { ScatterCell } from "./ScatterCell";
import { useTheme } from "@mui/material";

const expandedCellComponents: Record<ExpandedCellType, FC<ExpandedCellProps>> = {
    histogram: HistogramCell,
    scatter: ScatterCell,
 };

const BaseExpandedCell: FC<BaseExpandedCellProps & {
    type: ExpandedCellType;
   }> = ({type, ...props}) => {

    const theme = useTheme();
    const ChartComponent = expandedCellComponents[type];
    return (
      <g
        transform={`translate(${props.x},${props.y})`} onClick={props.onClick}
        >
        <rect className="expanded-cell-background"
          width={props.width}
          height={props.height}
          stroke={theme.palette.grey[300]}
          strokeWidth={2}
          fill={theme.palette.grey[100]}
          rx={3} // Add this line to give the rect a radius
          ry={3} // Add this line to give the rect a radius
          onMouseMove={(e) => props.onMouseMove(e)}
          onMouseLeave={props.onMouseLeave}
        />
        <ChartComponent {...props}/>
        <button onClick={props.onClose}/>
      </g>
    );
   };

   export {BaseExpandedCell}