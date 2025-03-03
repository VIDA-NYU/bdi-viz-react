
'use client';

import { Box, Typography } from '@mui/material';
import { BasicButton } from '../../layout/components';

interface GenerateExplanationButtonProps {
    selectedCandidate?: AggregatedCandidate;
    onClick: () => void;
}

const GenerateExplanationButton: React.FC<GenerateExplanationButtonProps> = ({ selectedCandidate, onClick }) => {
    return (
        <Box sx={{ minWidth: 80, flexGrow: 1, py: 2 }}>
            {selectedCandidate && selectedCandidate.matchers.includes("candidate_quadrants") ? (
                <>
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: '0.8rem',
                            color: 'text.secondary',
                            mb: 1,
                        }}
                    >
                        This is an <strong>EASY</strong> match because the name and values are similar.
                    </Typography>
                    <BasicButton
                        variant="contained"
                        color="info"
                        onClick={onClick}
                        fullWidth
                    >
                        Still want to know why?
                    </BasicButton>
                </>
            ) : (
                <BasicButton
                    variant="contained"
                    color="info"
                    onClick={onClick}
                    fullWidth
                >
                    Explain this candidate
                </BasicButton>
            )}
        </Box>
    );
}

export default GenerateExplanationButton;