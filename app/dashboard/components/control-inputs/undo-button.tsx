'use client';

import { Box, IconButton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

interface UndoButtonProps {
    onClick: () => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick }) => {
    return (
            <IconButton
                onClick={onClick}
                sx={{
                    px: 0,
                    py: 0,
                    borderRadius: 1,
                    color: 'grey.800',
                    '&:hover': { color: 'primary.dark' } 
                }}
                title="Undo"
            >
                <ReplayIcon />
            </IconButton>
    );
}

export default UndoButton;
