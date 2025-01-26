'use client';

import { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Checkbox, Select } from '@mui/material';


interface MatcherSelectionProps {
    matchers: string[];
    selectedMatchers: string[];
    onSelect: (matcher: string) => void;
}

const MatcherSelection: React.FC<MatcherSelectionProps> = ({ matchers, selectedMatchers, onSelect }) => {

    const handleSelect = (event: any) => {
        const value = event.target.value as string[];
        value.forEach(matcher => onSelect(matcher));
    };

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl fullWidth>
                <InputLabel id="matcher-multi-select-label">Matchers</InputLabel>
                <Select
                    labelId="matcher-multi-select-label"
                    multiple
                    value={selectedMatchers}
                    onChange={handleSelect}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                >
                    {matchers.map((matcher) => (
                        <MenuItem key={matcher} value={matcher}>
                            <Checkbox checked={selectedMatchers.indexOf(matcher) > -1} />
                            {matcher}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default MatcherSelection;