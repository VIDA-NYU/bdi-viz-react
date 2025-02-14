'use client';

import { Box, Button } from '@mui/material';

interface FilterEasyCasesButtonProps {
    onClick: () => void;
}

const FilterEasyCasesButton: React.FC<FilterEasyCasesButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="secondary"
                onClick={onClick}
            >
                Filter Easy Cases!
            </Button>
        </Box>
    );
}

export default FilterEasyCasesButton;