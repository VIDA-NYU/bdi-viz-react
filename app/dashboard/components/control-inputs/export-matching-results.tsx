'use client';

import { Box, Button } from '@mui/material';

interface ExportMatchingResultsButtonProps {
    onClick: () => void;
}

const ExportMatchingResultsButton: React.FC<ExportMatchingResultsButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="outlined"
                color="secondary"
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 60, fontSize: 12 }}
            >
                Export Results
            </Button>
        </Box>
    );
}

export default ExportMatchingResultsButton;