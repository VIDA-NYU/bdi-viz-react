'use client';

import { Box, Button } from '@mui/material';

interface UndoButtonProps {
    onClick: () => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="secondary"
                onClick={onClick}
            >
                Undo
            </Button>
        </Box>
    );
}

export default UndoButton;