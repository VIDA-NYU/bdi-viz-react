import {createContext} from 'react';

type SettingsGlobalState = {
    isLoadingGlobal: boolean;
    setIsLoadingGlobal: (isLoading: boolean) => void;
    developerMode: boolean;
    setDeveloperMode: (developerMode: boolean) => void;
    hoverMode: boolean;
    setHoverMode: (hoverMode: boolean) => void;
}

const SettingsGlobalContext = createContext<SettingsGlobalState>({
    isLoadingGlobal: false,
    setIsLoadingGlobal: () => { },
    developerMode: false,
    setDeveloperMode: () => { },
    hoverMode: false,
    setHoverMode: () => { },
});


export default SettingsGlobalContext;
