'use client';

import { Box, Button } from '@mui/material';

interface DiscardColumnButtonProps {
    onClick: () => void;
}

const DiscardColumnButton: React.FC<DiscardColumnButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <Button
                variant="contained"
                color='info'
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 50, fontSize: 11 }}
            >
                Discard 
            </Button>
        </Box>
    );
}

export default DiscardColumnButton;