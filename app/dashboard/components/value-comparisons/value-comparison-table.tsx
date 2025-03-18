import { useMemo, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { 
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from "material-react-table";
import HighlightGlobalContext from "@/app/lib/highlight/highlight-context";

interface ValueComparisonTableProps {
    valueMatches: ValueMatch[];
    weightedAggregatedCandidates: AggregatedCandidate[];
    selectedCandidate?: Candidate;
    selectedSourceColumn: string;
}

const ValueComparisonTable: React.FC<ValueComparisonTableProps> = ({
    valueMatches,
    weightedAggregatedCandidates,
    selectedCandidate,
    selectedSourceColumn,
}) => {
    const theme = useTheme();
    const { globalCandidateHighlight, globalQuery } = useContext(HighlightGlobalContext);

    const candidate = useMemo(() => {
        let candidate = selectedCandidate;
        if (selectedCandidate?.targetColumn === "") {
            if (globalCandidateHighlight) {
                candidate = globalCandidateHighlight as Candidate;
            }
        }
        return candidate;
    }, [selectedCandidate, globalCandidateHighlight]);

    const rows = useMemo(() => {
        if (!candidate) return [];
        const valueMatch = valueMatches.find(
            (valueMatch) => valueMatch.sourceColumn === candidate.sourceColumn
        );

        if (valueMatch) {
            const targetColumns = weightedAggregatedCandidates
                .filter((aggCandidate) => aggCandidate.sourceColumn === candidate.sourceColumn)
                .map((aggCandidate) => aggCandidate.targetColumn);
            return valueMatch.sourceValues.map((sourceValue, index) => {
                const rowObj: Record<string, any> = {
                    id: index,
                    [`${valueMatch.sourceColumn}(source)`]:  sourceValue,
                };
                const targetValueMatches = targetColumns
                    .map((targetColumn) =>
                        valueMatch.targets.find((target) => target.targetColumn === targetColumn)
                    )
                    .filter(target => target !== undefined);
                targetValueMatches.forEach((targetObj) => {
                    const targetColumn = targetObj.targetColumn;
                    const targetValue =
                        targetObj.targetValues[index] !== undefined ? targetObj.targetValues[index] : "";
                    rowObj[targetColumn] = targetValue;
                });
                return rowObj;
            });
        }
        return [];
    }, [valueMatches, weightedAggregatedCandidates, candidate, selectedSourceColumn]);

    const columns: MRT_ColumnDef<any>[] = useMemo(() => {
        if (!rows.length || !candidate) return [];
        const cols = Object.keys(rows[0])
            .map((key) => ({
                accessorKey: key,
                header: key,
            } as MRT_ColumnDef<any>))
            .filter((column) => column.accessorKey !== "id");
        return cols;
    }, [rows, candidate]);

    const table = useMaterialReactTable({
        columns: columns,
        data: rows,
        enableColumnPinning: true,
        enableTopToolbar: false,
        enableRowActions: false,
        enablePagination: false,
        enableBottomToolbar: false,
        initialState: {
            columnPinning: {
                left: candidate?.sourceColumn ? [`${candidate.sourceColumn}(source)`] : [],
            },
        },
        muiTableBodyCellProps: ({ cell, column, table }) => {
            const isSourceColumn = cell.column.id === `${candidate?.sourceColumn}(source)`;
            const isTargetColumn = cell.column.id === candidate?.targetColumn;
            const cellValue = cell.getValue();

            let cellStyle: React.CSSProperties = {
                backgroundColor: isSourceColumn
                    ? theme.palette.primary.dark
                    : isTargetColumn
                    ? theme.palette.secondary.dark
                    : undefined,
                color: isSourceColumn || isTargetColumn ? theme.palette.common.black : undefined,
                fontWeight: isSourceColumn || isTargetColumn ? "bold" : undefined,
            };

            if (
                globalQuery &&
                typeof cellValue === "string" &&
                cellValue.toLowerCase().includes(globalQuery.toLowerCase())
            ) {
                cellStyle = {
                    ...cellStyle,
                    fontWeight: "800",
                    color: theme.palette.primary.main,
                };
            }

            return {
                style: cellStyle,
            };
        },
        enableEditing: true,
        editDisplayMode: "cell",
    });

    useMemo(() => {
        const columnPinning = [];
        if (candidate?.sourceColumn) {
            columnPinning.push(`${candidate.sourceColumn}(source)`);
        }
        if (candidate?.targetColumn) {
            columnPinning.push(candidate.targetColumn);
        }
        table.setColumnPinning({ left: columnPinning });
    }, [candidate, table]);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <style>
                {`
                    tr {
                        height: 10px;
                    }
                    tr td {
                        height: auto !important;
                    }
                `}
            </style>
            <MaterialReactTable table={table} />
        </div>
    );
};

export default ValueComparisonTable;
