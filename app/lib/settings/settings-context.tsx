import {createContext} from 'react';

type LoadingGlobalState = {
    isLoadingGlobal: boolean;
    setIsLoadingGlobal: (isLoading: boolean) => void;
    developerMode: boolean;
    setDeveloperMode: (developerMode: boolean) => void;
    hoverMode: boolean;
    setHoverMode: (hoverMode: boolean) => void;
}

const SettingsGlobalContext = createContext<LoadingGlobalState>({
    isLoadingGlobal: false,
    setIsLoadingGlobal: () => { },
    developerMode: false,
    setDeveloperMode: () => { },
    hoverMode: true,
    setHoverMode: () => { },
});


export default SettingsGlobalContext;
