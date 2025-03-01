import { useTheme } from "@mui/material";

import { StyledText } from "@/app/dashboard/layout/components";

interface YAixsProps {
  y: any;
  getHeight: (d: Candidate) => number;
}

const YAixs = ({ y, getHeight }: YAixsProps) => {
  const theme = useTheme();

  return (
    <g>
      <g>
        <StyledText
          transform={`translate(-120, ${y.range()[1] / 2 + 10}) rotate(-90)`}
          textAnchor="middle"
          style={{ fontSize: "1em", fontWeight: "600" }}
        >
          Source Attributes
        </StyledText>
      </g>
      <line
        y1={0}
        y2={y.range()[1]}
        stroke={theme.palette.grey[500]}
        strokeWidth={2}
      />
      {y.domain().map((value: string) => {
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
