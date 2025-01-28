'use client';

import { Box, FormControl, FormGroup, FormControlLabel, InputLabel, MenuItem, Checkbox } from '@mui/material';


interface MatcherSelectionProps {
    matchers: string[];
    selectedMatchers: string[];
    onSelect: (matcher: string) => void;
}

const MatcherSelection: React.FC<MatcherSelectionProps> = ({ matchers, selectedMatchers, onSelect }) => {

    const handleSelect = (matcher: string) => {
        
        onSelect(matcher);
    };

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl component="fieldset">
            <FormGroup>
            {matchers.map((matcher) => (
            <FormControlLabel
                key={matcher}
                control={
                    <Checkbox
                        checked={selectedMatchers.indexOf(matcher) > -1}
                        onChange={() => handleSelect(matcher)}
                        sx={{ color: 'black' }}
                    />
                }
                label={matcher}
                sx={{ color: 'black' }}
            />
            ))}
            </FormGroup>
            </FormControl>
        </Box>
    );
}

export default MatcherSelection;