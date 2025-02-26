'use client';

import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';


interface SourceColumnSelectionProps {
    sourceColumns: string[];
    selectedSourceColumn: string;
    onSelect: (column: string) => void;
}

const SourceColumnSelection: React.FC<SourceColumnSelectionProps> = ({ sourceColumns, selectedSourceColumn, onSelect }) => {
    const [sourceColumn, setSourceColumn] = useState<string>(sourceColumns[0]);

    const handleChange = (column: string) => {
        setSourceColumn(column);
        onSelect(column);
    }

    useEffect(() => {
        if (selectedSourceColumn) {
            setSourceColumn(selectedSourceColumn);
        }
    }, [selectedSourceColumn]);

    return (
        <Box sx={{ width: "100%", flexGrow: 1 }}>
            <FormControl size="small" fullWidth>
                <InputLabel id="source-column-select-label">Source Column</InputLabel>
                <Select
                    labelId="source-column-select-label"
                    id="source-column-select"
                    value={sourceColumn}
                    label="Source Column"
                    onChange={(e) => handleChange(e.target.value as string)}
                    sx={{
                        '& .MuiSelect-select': {
                            fontSize: 12,
                        },
                    }}
                >
                    {sourceColumns.map((column) => (
                        <MenuItem key={column} value={column}>{column}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default SourceColumnSelection;