
'use client';

import { useContext } from 'react';
import { Box, Pagination } from '@mui/material';
import PaginationGlobalContext from '@/app/lib/pagination/pagination-context';



interface PaginatorProps {}

const Paginator: React.FC<PaginatorProps> = ({}) => {
    const {
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        totalPages,
    } = useContext(PaginationGlobalContext);


    return (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ backgroundColor: 'grey.100', py: 2 }}>
            <Pagination
                count={totalPages}
                page={pageNumber}
                onChange={(event, value) => setPageNumber(value)}
                color="primary"
                sx={{
                    '& .MuiPaginationItem-root.Mui-selected': {
                        borderRadius: 1,
                    },
                }}
            />
        </Box>
    );

};

export default Paginator;