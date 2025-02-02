'use client';

import { Box, FormControl, FormGroup, FormControlLabel, InputLabel, MenuItem, Checkbox } from '@mui/material';


interface MatcherSelectionProps {
    matchers: Matcher[];
    selectedMatchers: Matcher[];
    onSelect: (matcher: Matcher) => void;
}

const MatcherSelection: React.FC<MatcherSelectionProps> = ({ matchers, selectedMatchers, onSelect }) => {

    const handleSelect = (matcher: Matcher) => {
        
        onSelect(matcher);
    };

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl component="fieldset">
            <FormGroup>
            {matchers.map((matcher) => (
            <FormControlLabel
                key={matcher.name}
                control={
                    <Checkbox
                        checked={selectedMatchers.indexOf(matcher) > -1}
                        onChange={() => handleSelect(matcher)}
                        sx={{ color: 'black' }}
                    />
                }
                label={matcher.name}
                sx={{ color: 'black' }}
            />
            ))}
            </FormGroup>
            </FormControl>
        </Box>
    );
}

export default MatcherSelection;