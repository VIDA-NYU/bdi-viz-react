import {createContext} from 'react';

type HighlightGlobalState = {
    globalValueSelection?: string;
    setGlobalValueSelection: (value: string) => void;
    globalValueConnections: [number, number][];
    setGlobalValueConnections: (value: [number, number][]) => void;
}

const HighlightGlobalContext = createContext<HighlightGlobalState>({
    globalValueSelection: "T0",
    setGlobalValueSelection: () => {},
    globalValueConnections: [],
    setGlobalValueConnections: () => {},
});


export default HighlightGlobalContext;
