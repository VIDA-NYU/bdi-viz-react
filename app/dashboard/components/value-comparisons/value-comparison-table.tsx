import { use, useEffect, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";


interface ValueComparisonTableProps {
    valueMatches: ValueMatch[];
    selectedCandidate?: Candidate;
}

const ValueComparisonTable: React.FC<ValueComparisonTableProps> = ({ valueMatches, selectedCandidate }) => {

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataGrid
                rows={rows || []}
                columns={Object.keys(rows?.[0] || {}).map((field) => ({
                    field,
                    headerName: field,
                    width: 150,
                }))}
            />
        </div>
    );
}

export default ValueComparisonTable;