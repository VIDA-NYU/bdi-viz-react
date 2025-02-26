'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface DiscardColumnButtonProps {
    onClick: () => void;
}

const DiscardColumnButton: React.FC<DiscardColumnButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <BasicButton
                variant="contained"
                color='info'
                onClick={onClick}
                fullWidth
            >
                Discard
            </BasicButton>
        </Box>
    );
}

export default DiscardColumnButton;