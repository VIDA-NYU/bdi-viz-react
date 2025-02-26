'use client';

import { Box, Button } from '@mui/material';

interface AcceptMatchButtonProps {
    onClick: () => void;
}

const AcceptMatchButton: React.FC<AcceptMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="success"
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 50, fontSize: 11 }}
            >
                Accept Match
            </Button>
        </Box>
    );
}

export default AcceptMatchButton;