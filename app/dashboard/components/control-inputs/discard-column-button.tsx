'use client';

import { Box, IconButton } from '@mui/material';
import { BasicButton } from '../../layout/components';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface DiscardColumnButtonProps {
    onClick: () => void;
}

const DiscardColumnButton: React.FC<DiscardColumnButtonProps> = ({ onClick }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                px: 0,
                py: 0,
                borderRadius: 1,
                color: 'grey.800',
                '&:hover': { color: 'error.dark' }
            }}
            title="Discard Column"
        >
            <DeleteForeverIcon />
        </IconButton>
    );
}

export default DiscardColumnButton;