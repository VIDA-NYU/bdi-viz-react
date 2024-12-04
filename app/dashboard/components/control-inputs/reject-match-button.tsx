'use client';

import { useState } from 'react';
import { Box, Button } from '@mui/material';

interface RejectMatchButtonProps {
    onClick: () => void;
}

const RejectMatchButton: React.FC<RejectMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                onClick={onClick}
            >
                Reject Match
            </Button>
        </Box>
    );
}

export default RejectMatchButton;