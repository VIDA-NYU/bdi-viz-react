'use client';

import { Box, IconButton } from '@mui/material';
import { BasicButton } from '../../layout/components';
import IosShareIcon from '@mui/icons-material/IosShare';

interface ExportMatchingResultsButtonProps {
    onClick: () => void;
}

const ExportMatchingResultsButton: React.FC<ExportMatchingResultsButtonProps> = ({ onClick }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                py: 0,
                px: 0,
                borderRadius: 1,
                color: 'primary.main',
                '&:hover': { color: 'primary.dark' },
            }}
            title="Export Matching Results"
        >
            <IosShareIcon />
        </IconButton>
    );
}

export default ExportMatchingResultsButton;