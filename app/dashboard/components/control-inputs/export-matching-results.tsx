'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface ExportMatchingResultsButtonProps {
    onClick: () => void;
}

const ExportMatchingResultsButton: React.FC<ExportMatchingResultsButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <BasicButton
                variant="outlined"
                color="secondary"
                onClick={onClick}
                fullWidth
            >
                Export Results
            </BasicButton>
        </Box>
    );
}

export default ExportMatchingResultsButton;