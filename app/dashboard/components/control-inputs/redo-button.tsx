'use client';

import { Box, Button } from '@mui/material';

interface RedoButtonProps {
    onClick: () => void;
}

const RedoButton: React.FC<RedoButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="primary"
                onClick={onClick}
            >
                Redo
            </Button>
        </Box>
    );
}

export default RedoButton;