'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface UndoButtonProps {
    onClick: () => void;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <BasicButton
                variant="outlined"
                color="primary"
                onClick={onClick}
                fullWidth
            >
                Undo
            </BasicButton>
        </Box>
    );
}

export default UndoButton;