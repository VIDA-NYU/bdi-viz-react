'use client';

import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';


interface SourceColumnSelectionProps {
    sourceColumns: string[];
    selectedSourceColumn: string;
    onSelect: (column: string) => void;
}

const SourceColumnSelection: React.FC<SourceColumnSelectionProps> = ({ sourceColumns, selectedSourceColumn, onSelect }) => {
    const [sourceColumn, setSourceColumn] = useState<string>("all");

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
                <InputLabel id="source-column-select-label">Source Attribute</InputLabel>
                <Select
                    labelId="source-column-select-label"
                    id="source-column-select"
                    value={sourceColumn}
                    label="Source Attribute"
                    onChange={(e) => handleChange(e.target.value as string)}
                    sx={{
                        '& .MuiSelect-select': {
                            fontSize: 12,
                        },
                    }}
                >
                    <MenuItem key="all" value="all">All</MenuItem>
                    {sourceColumns.map((column) => (
                        <MenuItem key={column} value={column}>{column}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default SourceColumnSelection;