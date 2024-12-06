'use client';

import { Box, Button } from '@mui/material';

interface AcceptMatchButtonProps {
    onClick: () => void;
}

const AcceptMatchButton: React.FC<AcceptMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="success"
                onClick={onClick}
            >
                Accept Match
            </Button>
        </Box>
    );
}

export default AcceptMatchButton;