'use client';

import { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface CandidateTypeSelectionProps {
    onSelect: (type: string) => void;
}

const CandidateTypeSelection: React.FC<CandidateTypeSelectionProps> = ({ onSelect }) => {
    const [candidateType, setCandidateType] = useState<string>('all');

    const handleChange = (type: string) => {
        setCandidateType(type);
        onSelect(type);
    }

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl fullWidth>
                <InputLabel id="candidate-type-select-label">Candidate Type</InputLabel>
                <Select
                    labelId="candidate-type-select-label"
                    id="candidate-type-select"
                    value={candidateType}
                    label="Candidate Type"
                    onChange={(e) => handleChange(e.target.value as string)}
                >
                    <MenuItem key='all' value='all'>All</MenuItem>
                    <MenuItem key='enum' value='enum'>Enum</MenuItem>
                    <MenuItem key='string' value='string'>String</MenuItem>
                    <MenuItem key='number' value='number'>Number</MenuItem>
                    
                </Select>
            </FormControl>
        </Box>
    );
}

export default CandidateTypeSelection;