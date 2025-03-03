import { useTheme } from "@mui/material";

import { StyledText } from "@/app/dashboard/layout/components";

interface YAixsProps {
  y: any;
  getHeight: (d: Candidate) => number;
  sourceColumn: string;
}

const YAixs = ({ y, getHeight, sourceColumn }: YAixsProps) => {
  const theme = useTheme();

  return (
    <g>
      <g>
        <StyledText
          transform={`translate(-110, ${y.range()[1] / 2 + 10}) rotate(-90)`}
          textAnchor="middle"
          style={{ fontSize: "1em", fontWeight: "600" }}
        >
          Source Attributes
        </StyledText>
      </g>
      <defs>
        <marker
          id="arrowUp"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            transform="translate(0, -2) rotate(-90 5 5)"
            d="M0,10 L3,0 L6,10"
            fill={theme.palette.grey[500]}
          />
        </marker>
      </defs>
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={y.range()[1]}
        stroke={theme.palette.grey[500]}
        strokeWidth={2}
        markerStart="url(#arrowUp)"
      />
      <StyledText
        x={5}
        y={0}
        textAnchor="start"
        style={{
          fontSize: "0.8em",
          fill: theme.palette.grey[500],
        }}
      >
        less similar
      </StyledText>
      {y.domain().map((value: string) => {
        const isSelected = value === sourceColumn;
        const yPos = y(value)!;
        const height = getHeight({ sourceColumn: value } as Candidate);
        const textValue =
          value.length > 15 ? value.slice(0, 12) + "..." : value;
        const textWidth = 0;
        return (
          <g
            key={value}
            transform={`translate(-5,${yPos + height / 2})`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.querySelector("rect");
              const text = e.currentTarget.querySelector("text");
              if (rect && text) {
                const textValue = value;
                text.textContent = textValue;
                const textWidth = text.getBBox().width;
                rect.setAttribute("width", `${textWidth}`);
                rect.setAttribute("x", `${-textWidth}`);
              }
            }}
            onMouseLeave={(e) => {
              const rect = e.currentTarget.querySelector("rect");
              const text = e.currentTarget.querySelector("text");
              if (rect && text) {
                text.textContent = textValue;
                rect.setAttribute("width", `${textWidth}`);
                rect.setAttribute("x", `${-textWidth}`);
              }
            }}
          >
            <rect
              x={-textWidth}
              y={-10}
              width={textWidth}
              height={20}
              fill={theme.palette.grey[200]}
              stroke={theme.palette.grey[500]}
              strokeWidth={isSelected ? 2 : 0}
              rx={3}
              ry={3}
            />
            <StyledText
              dy=".35em"
              textAnchor="end"
              style={{
                fill: theme.palette.grey[600],
                fontSize: "0.8em",
                fontWeight: "600",
                cursor: "pointer",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {textValue}
            </StyledText>
          </g>
        );
      })}
    </g>
  );
};

export { YAixs };
