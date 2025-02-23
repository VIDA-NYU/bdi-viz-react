import {createContext} from 'react';

type LoadingGlobalState = {
    isLoadingGlobal: boolean;
    setIsLoadingGlobal: (isLoading: boolean) => void;
    developerMode: boolean;
    setDeveloperMode: (developerMode: boolean) => void;
}

const LoadingGlobalContext = createContext<LoadingGlobalState>({
    isLoadingGlobal: false,
    setIsLoadingGlobal: () => { },
    developerMode: false,
    setDeveloperMode: () => { },
});


export default LoadingGlobalContext;
