'use client';

import { Box, Button } from '@mui/material';

interface DiscardColumnButtonProps {
    onClick: () => void;
}

const DiscardColumnButton: React.FC<DiscardColumnButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                onClick={onClick}
            >
                Discard 
            </Button>
        </Box>
    );
}

export default DiscardColumnButton;