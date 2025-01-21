"use client";

import { useState, createContext, ReactNode } from 'react';
import LoadingGlobalContext from './loading-context';

const LoadingGlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

    const value = {
        isLoadingGlobal,
        setIsLoadingGlobal,
    }

    return (
        <LoadingGlobalContext.Provider value={value}>
            {children}
        </LoadingGlobalContext.Provider>
    );
}

export default LoadingGlobalProvider;

