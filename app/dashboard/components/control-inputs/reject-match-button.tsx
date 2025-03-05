'use client';

import { Box, IconButton } from '@mui/material';
import { BasicButton } from '../../layout/components';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

interface RejectMatchButtonProps {
    onClick: () => void;
}

const RejectMatchButton: React.FC<RejectMatchButtonProps> = ({ onClick }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                px: 0,
                py: 0,
                borderRadius: 1,
                color: 'error.main',
                '&:hover': { color: 'error.dark' }
            }}
            title="Reject Match"
        >
            <HighlightOffIcon />
        </IconButton>
    );
}

export default RejectMatchButton;