'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface RedoButtonProps {
    onClick: () => void;
}

const RedoButton: React.FC<RedoButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <BasicButton
                variant="outlined"
                color="primary"
                onClick={onClick}
                fullWidth
            >
                Redo
            </BasicButton>
        </Box>
    );
}

export default RedoButton;