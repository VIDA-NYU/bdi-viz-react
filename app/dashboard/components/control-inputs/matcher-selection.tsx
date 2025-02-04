'use client';

import { useState, useEffect } from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel } from '@mui/material';

interface MatcherSelectionProps {
    matchers: Matcher[];
    selectedMatcher: Matcher;
    onSelect: (matcher: Matcher) => void;
}

const MatcherSelection: React.FC<MatcherSelectionProps> = ({ matchers, selectedMatcher, onSelect }) => {
    const [matcher, setMatcher] = useState<string>("");

    const handleSelect = (matcher: string) => {
        setMatcher(matcher);
        onSelect(matchers.find((m) => m.name === matcher) as Matcher);
    };

    useEffect(() => {
        if (selectedMatcher) {
            setMatcher(selectedMatcher.name);
        }
    }, [selectedMatcher]);

    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <FormControl fullWidth>
                <InputLabel id="matcher-select-label">Matcher</InputLabel>
                <Select
                    labelId="matcher-select-label"
                    id="matcher-select"
                    value={matcher}
                    label="Matcher"
                    onChange={(e) => handleSelect(e.target.value as string)}
                    sx={{ color: 'black' }}
                >
                    {matchers.map((matcher) => (
                        <MenuItem key={matcher.name} value={matcher.name}>
                            {matcher.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default MatcherSelection;
