'use client';

import { Box, Button } from '@mui/material';

interface RedoButtonProps {
    onClick: () => void;
}

const RedoButton: React.FC<RedoButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <Button
                variant="outlined"
                color="primary"
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 50, fontSize: 11 }}
            >
                Redo
            </Button>
        </Box>
    );
}

export default RedoButton;