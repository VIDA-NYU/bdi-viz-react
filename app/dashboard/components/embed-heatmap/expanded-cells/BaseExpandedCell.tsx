import { BaseExpandedCellProps, ExpandedCellProps, ExpandedCellType } from "./types";
import {HistogramCell} from './HistogramCell';
import { FC } from "react";
import { ScatterCell } from "./ScatterCell";
const expandedCellComponents: Record<ExpandedCellType, FC<ExpandedCellProps>> = {
    histogram: HistogramCell,
    scatter: ScatterCell,
 };

const BaseExpandedCell: FC<BaseExpandedCellProps & {
    type: ExpandedCellType;
   }> = ({type, ...props}) => {
    const ChartComponent = expandedCellComponents[type];
    return (
      <g
        transform={`translate(${props.x},${props.y})`}
        >
        <rect className="expanded-cell-background"
            width={props.width}
            height={props.height}
            stroke="grey"
            strokeWidth={2}
            fill="white"
        />
        <ChartComponent {...props}/>
        <button onClick={props.onClose}/>
      </g>
    );
   };

   export {BaseExpandedCell}