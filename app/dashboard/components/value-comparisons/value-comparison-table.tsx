import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { 
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from "material-react-table";

interface ValueComparisonTableProps {
    valueMatches: ValueMatch[];
    selectedCandidate?: Candidate;
}

const ValueComparisonTable: React.FC<ValueComparisonTableProps> = ({ valueMatches, selectedCandidate }) => {
    const theme = useTheme();

    const rows = useMemo(() => {
        if (!selectedCandidate) {
            return [];
        }
        const valueMatch = valueMatches.find((valueMatch) => valueMatch.sourceColumn === selectedCandidate.sourceColumn);
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
    }, [valueMatches, selectedCandidate]);

    const columns: MRT_ColumnDef<any>[] = useMemo(() => {

        if (!rows) {
            return [];
        }

        const columns = Object.keys(rows?.[0] || {}).map((key) => ({
            accessorKey: key,
            header: key,
        })).filter(column => column.accessorKey !== "id");

        // Move the selected target column to the first position
        if (selectedCandidate?.targetColumn && columns.length > 0) {
            const targetColumnIndex = columns.findIndex(column => column.accessorKey === selectedCandidate.targetColumn);
            if (targetColumnIndex > -1) {
                const [targetColumn] = columns.splice(targetColumnIndex, 1);
                columns.unshift(targetColumn);
            }
        }

        return columns;
    }, [rows, selectedCandidate]);

    const table = useMaterialReactTable({
        columns: columns,
        data: rows || [],
        enableColumnPinning: true,
        enableTopToolbar: false,
        enableRowActions: false,
        initialState: {
            columnPinning: {
                left: selectedCandidate?.sourceColumn ? [selectedCandidate.sourceColumn] : []
            }
        },
        muiTableBodyCellProps: ({ cell }) => {
            const isSourceColumn = cell.column.id === selectedCandidate?.sourceColumn;
            const isTargetColumn = cell.column.id === selectedCandidate?.targetColumn;
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
        if (selectedCandidate?.sourceColumn) {
            columnPinning.push(selectedCandidate.sourceColumn);
        }
        if (selectedCandidate?.targetColumn) {
            columnPinning.push(selectedCandidate.targetColumn);
        }
        table.setColumnPinning({
            left: columnPinning,
        });
    }, [selectedCandidate]);

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