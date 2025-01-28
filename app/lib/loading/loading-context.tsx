import {createContext} from 'react';

type LoadingGlobalState = {
    isLoadingGlobal: boolean;
    setIsLoadingGlobal: (isLoading: boolean) => void;
}

const LoadingGlobalContext = createContext<LoadingGlobalState>({
    isLoadingGlobal: false,
    setIsLoadingGlobal: () => { },
});


export default LoadingGlobalContext;
