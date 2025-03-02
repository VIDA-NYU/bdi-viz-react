'use client';

import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, useTheme } from '@mui/material';


interface SourceColumnSelectionProps {
    sourceColumns: SourceColumn[];
    selectedSourceColumn: string;
    onSelect: (column: string) => void;
}

const SourceColumnSelection: React.FC<SourceColumnSelectionProps> = ({ sourceColumns, selectedSourceColumn, onSelect }) => {
    const [sourceColumn, setSourceColumn] = useState<string>("all");

    const theme = useTheme();

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
                        <MenuItem 
                            key={column.name} 
                            value={column.name}
                            sx={{ 
                                backgroundColor: column.status === 'complete' ? theme.palette.success.light : column.status === 'ignored' ? theme.palette.grey[400] : 'inherit',
                                '&:hover': {
                                    backgroundColor: column.status === 'complete' ? "#009900 !important" : column.status === 'ignored' ? theme.palette.grey[600] : theme.palette.grey[200],
                                }
                            }}
                        >
                            {column.name}
                            {column.status === 'complete' && (
                                <span style={{ marginLeft: 'auto' }}>✔️</span>
                            )}
                            {column.status === 'ignored' && (
                                <span style={{ marginLeft: 'auto' }}>❌</span>
                            )}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default SourceColumnSelection;