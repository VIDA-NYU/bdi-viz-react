'use client';

import { Box, Button } from '@mui/material';

interface UndoButtonProps {
    onClick: () => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <Button
                variant="outlined"
                color="primary"
                onClick={onClick}
                fullWidth
                sx={{ minHeight: 50, fontSize: 11 }}
            >
                Undo
            </Button>
        </Box>
    );
}

export default UndoButton;