'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface RejectMatchButtonProps {
    onClick: () => void;
}

const RejectMatchButton: React.FC<RejectMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <BasicButton
                variant="contained"
                color="error"
                onClick={onClick}
                fullWidth
            >
                Reject
            </BasicButton>
        </Box>
    );
}

export default RejectMatchButton;