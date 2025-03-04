import { useMemo, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { 
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from "material-react-table";
import HighlightGlobalContext from "@/app/lib/highlight/highlight-context";
import { updateSourceValue } from "@/app/lib/heatmap/heatmap-helper";

interface ValueComparisonTableProps {
    valueMatches: ValueMatch[];
    selectedCandidate?: Candidate;
    handleValueMatches: (valueMatches: ValueMatch[]) => void;
}

const ValueComparisonTable: React.FC<ValueComparisonTableProps> = ({ valueMatches, selectedCandidate, handleValueMatches }) => {
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
        muiTableBodyCellProps: ({ cell, column, table }) => {
            const isSourceColumn = cell.column.id === candidate?.sourceColumn;
            const isTargetColumn = cell.column.id === candidate?.targetColumn;
            return {
                onClick: () => {
                    console.log(column, "column");
                    if (isSourceColumn) {
                        table.setEditingCell(cell); //set editing cell
                    } else {
                        // Set source column accordingly
                        if (candidate) {
                            updateSourceValue({
                                column: candidate?.sourceColumn,
                                value: cell.row.original[candidate?.sourceColumn],
                                newValue: cell.row.original[column.id],
                                valueMatchesCallback: handleValueMatches,
                            });
                        }
                    }
                    
                },
                style: {
                    backgroundColor: isSourceColumn ? theme.palette.primary.dark : isTargetColumn ? theme.palette.secondary.dark : undefined,
                    color: isSourceColumn ? theme.palette.common.black : isTargetColumn ? theme.palette.common.black : undefined,
                    fontWeight: isSourceColumn || isTargetColumn ? 'bold' : undefined,
                },
                onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                        if (isSourceColumn) {
                            if (candidate) {
                                updateSourceValue({
                                    column: candidate?.sourceColumn,
                                    value: cell.row.original[candidate?.sourceColumn],
                                    newValue: cell.getValue(),
                                    valueMatchesCallback: handleValueMatches,
                                });
                            }
                            table.setEditingCell(null); //set editing cell
                        }
                    }
                }
            };
        },
        enableEditing: true,
        editDisplayMode: 'cell',
        // onEditingCellChange: ({column, getValue}) => {
        //     console.log('onEditCellChange', column, getValue());
        // },
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
