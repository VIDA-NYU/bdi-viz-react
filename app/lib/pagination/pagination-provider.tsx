"use client";

import { useState, ReactNode } from 'react';
import PaginationGlobalContext from './pagination-context';

const PaginationGlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    const value = {
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        totalPages,
        setTotalPages,
    }

    return (
        <PaginationGlobalContext.Provider value={value}>
            {children}
        </PaginationGlobalContext.Provider>
    );
}

export default PaginationGlobalProvider;

