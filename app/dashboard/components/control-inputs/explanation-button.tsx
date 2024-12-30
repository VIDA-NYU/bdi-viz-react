'use client';
import { Box, Button } from '@mui/material';
interface ExplanationButtonProps {
    onClick: () => void;
}
const ExplanationButton: React.FC<ExplanationButtonProps> = ({ onClick }) => {
    return (
        <Box sx={{ minWidth: 120, flexGrow: 1 }}>
            <Button
                variant="contained"
                color="warning"
                onClick={onClick}
            >
                Explain Candidate
            </Button>
        </Box>
    );
}
export default ExplanationButton;