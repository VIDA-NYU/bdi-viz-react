'use client';

import { Box } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface AcceptMatchButtonProps {
    onClick: () => void;
}

const AcceptMatchButton: React.FC<AcceptMatchButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1 }}>
            <BasicButton
                variant="contained"
                color="success"
                onClick={onClick}
                fullWidth
            >
                Accept
            </BasicButton>
        </Box>
    );
}

export default AcceptMatchButton;