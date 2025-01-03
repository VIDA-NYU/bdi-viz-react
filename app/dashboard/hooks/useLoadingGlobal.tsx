import { useState, useCallback } from 'react';


type LoadingGlobalState = {
    isLoadingGlobal: boolean;
    setIsLoadingGlobal: (isLoading: boolean) => void;
}

export type { LoadingGlobalState };

export const {
    useLoadingGlobal
} = {
    useLoadingGlobal: (): LoadingGlobalState => {
        const [isLoadingGlobal, setIsLoadingGlobal] = useState<boolean>(false);

        return {
            isLoadingGlobal,
            setIsLoadingGlobal
        };
    }
};