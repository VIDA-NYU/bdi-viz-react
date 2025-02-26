'use client';

import { Box, Button } from '@mui/material';

interface RejectMatchButtonProps {
    onClick: () => void;
}

const RejectMatchButton: React.FC<RejectMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="error"
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 50, fontSize: 11 }}
            >
                Reject Match
            </Button>
        </Box>
    );
}

export default RejectMatchButton;