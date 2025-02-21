'use client';

import { Box, Button } from '@mui/material';

interface FilterEasyCasesButtonProps {
    onClick: () => void;
}

const FilterEasyCasesButton: React.FC<FilterEasyCasesButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="outlined"
                color="secondary"
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 60, fontSize: 12 }}
            >
                Filter Easy Cases!
            </Button>
        </Box>
    );
}

export default FilterEasyCasesButton;