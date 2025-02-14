'use client';

import { Box, Button } from '@mui/material';

interface RejectMatchButtonProps {
    onClick: () => void;
}

const RejectMatchButton: React.FC<RejectMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="error"
                onClick={onClick}
            >
                Reject Match
            </Button>
        </Box>
    );
}

export default RejectMatchButton;