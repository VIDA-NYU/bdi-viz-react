'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface FilterEasyCasesButtonProps {
    onClick: () => void;
}

const FilterEasyCasesButton: React.FC<FilterEasyCasesButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <BasicButton
                variant="outlined"
                color="secondary"
                onClick={onClick}
                fullWidth
            >
                Filter Easy Cases!
            </BasicButton>
        </Box>
    );
}

export default FilterEasyCasesButton;