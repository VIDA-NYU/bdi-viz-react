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
    selectedCandidate?: Candidate;
}

const ValueComparisonTable: React.FC<ValueComparisonTableProps> = ({ valueMatches, selectedCandidate }) => {
    const theme = useTheme();

    const { globalCandidateHighlight } = useContext(HighlightGlobalContext);

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
        if (!candidate) {
            return [];
        }
        const valueMatch = valueMatches.find((valueMatch) => valueMatch.sourceColumn === candidate.sourceColumn);
        if (valueMatch) {
            const rows = valueMatch.sourceValues.map((sourceValue, index) => {
                const rowObj = {
                    id: index,
                    [valueMatch.sourceColumn]: sourceValue,
                };
                valueMatch.targets.forEach((targetObj) => {
                    const targetColumn = targetObj.targetColumn;
                    const targetValue = targetObj.targetValues[index] !== undefined ? targetObj.targetValues[index] : "";
                    rowObj[targetColumn] = targetValue;
                });
                return rowObj;
            });

            return rows;
        }
    }, [valueMatches, candidate]);

    const columns: MRT_ColumnDef<any>[] = useMemo(() => {
        if (!rows) {
            return [];
        }

        const columns = Object.keys(rows?.[0] || {}).map((key) => ({
            accessorKey: key,
            header: key,
        })).filter(column => column.accessorKey !== "id");

        // Move the selected target column to the first position
        if (candidate?.targetColumn && columns.length > 0) {
            const targetColumnIndex = columns.findIndex(column => column.accessorKey === candidate.targetColumn);
            if (targetColumnIndex > -1) {
                const [targetColumn] = columns.splice(targetColumnIndex, 1);
                columns.unshift(targetColumn);
            }
        }

        return columns;
    }, [rows, candidate]);

    const table = useMaterialReactTable({
        columns: columns,
        data: rows || [],
        enableColumnPinning: true,
        enableTopToolbar: false,
        enableRowActions: false,
        enablePagination: false,
        enableBottomToolbar: false, //hide the bottom toolbar as well if you want
        initialState: {
            columnPinning: {
                left: candidate?.sourceColumn ? [candidate.sourceColumn] : []
            }
        },
        muiTableBodyCellProps: ({ cell }) => {
            const isSourceColumn = cell.column.id === candidate?.sourceColumn;
            const isTargetColumn = cell.column.id === candidate?.targetColumn;
            return {
                style: {
                    backgroundColor: isSourceColumn ? theme.palette.error.main : isTargetColumn ? theme.palette.info.main : undefined,
                    color: isSourceColumn ? theme.palette.common.black : isTargetColumn ? theme.palette.common.black : undefined,
                    fontWeight: isSourceColumn || isTargetColumn ? 'bold' : undefined,
                },
            };
        },
    });

    useMemo(() => {
        const columnPinning = [];
        if (candidate?.sourceColumn) {
            columnPinning.push(candidate.sourceColumn);
        }
        if (candidate?.targetColumn) {
            columnPinning.push(candidate.targetColumn);
        }
        table.setColumnPinning({
            left: columnPinning,
        });
    }, [candidate, table]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            <MaterialReactTable 
                table={table}
            />
        </div>
    );
}

export default ValueComparisonTable;
