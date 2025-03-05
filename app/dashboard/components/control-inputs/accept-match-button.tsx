'use client';

import { Box, IconButton } from '@mui/material';
import { BasicButton } from '../../layout/components';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface AcceptMatchButtonProps {
    onClick: () => void;
}

const AcceptMatchButton: React.FC<AcceptMatchButtonProps> = ({ onClick }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                px: 0,
                py: 0,
                borderRadius: 1,
                color: 'success.main',
                '&:hover': { color: 'success.dark' }
            }}
            title="Accept Match"
        >
            <CheckCircleOutlineIcon />
        </IconButton>
    );
}

export default AcceptMatchButton;