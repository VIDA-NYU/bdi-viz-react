import {createContext} from 'react';

type PaginationGlobalState = {
    pageNumber: number;
    setPageNumber: (pageNumber: number) => void;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    totalPages: number;
    setTotalPages: (totalPages: number) => void;
}

const PaginationGlobalContext = createContext<PaginationGlobalState>({
    pageNumber: 1,
    setPageNumber: () => { },
    pageSize: 10,
    setPageSize: () => { },
    totalPages: 0,
    setTotalPages: () => { },
});


export default PaginationGlobalContext;
