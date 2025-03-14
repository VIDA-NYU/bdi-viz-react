import React, {useState, useCallback, useContext} from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { agentSearchRequest } from '@/app/lib/langchain/agent-helper';
import HighlightGlobalContext from '@/app/lib/highlight/highlight-context';


interface SearchBarProps {
    agentSearchResultCallback: (candidates: Candidate[]) => void;

}


const SearchBar: React.FC<SearchBarProps> = ({
    agentSearchResultCallback
}: SearchBarProps) => {
    const [query, setQuery] = useState<string>('');
    const [agentActivated, setAgentActivated] = useState<boolean>(false);
    const { setGlobalQuery } = useContext(HighlightGlobalContext);

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            await handleSearch();
        }
    };

    const handleSearch = useCallback(async () => {
        if (agentActivated) {
            const candidates = await agentSearchRequest(query);
            if (candidates) {
                console.log("Candidates: ", candidates);
                agentSearchResultCallback(candidates);
            }
        } else {
            console.log("Global query: ", query);
            setGlobalQuery(query);
        }
    }, [query, agentActivated]);

    return (
        <TextField
            variant="outlined"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
                setQuery(e.target.value)
                if (!agentActivated) {
                    setGlobalQuery(e.target.value);
                }
            }}
            onKeyDown={handleKeyPress}
            color='secondary'
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        {query && (
                            <IconButton
                                onClick={() => {
                                    setQuery('');
                                    setGlobalQuery(undefined);
                                    agentSearchResultCallback([]); // Reset search results
                                }}
                                sx={{ px: 0 }}
                                title="Clear search"
                            >
                                <ClearIcon />
                            </IconButton>
                        )}
                        <IconButton
                            onClick={async () => {
                                console.log("Toggle agent activated: ", agentActivated);
                                setAgentActivated(!agentActivated);
                            }}
                            sx={{ 
                                px: 0, 
                                width: '50px',
                                height: '100%',
                                borderRadius: 1,
                                backgroundColor: agentActivated ? 'success.main' : 'grey.300',
                                '&:hover': {
                                    backgroundColor: agentActivated ? 'success.dark' : 'grey.400',
                                }
                            }}
                            title={agentActivated ? 'Deactivate agent' : 'Activate agent'}
                        >
                            <SmartToyIcon style={{ color: 'white' }} />
                        </IconButton>
                    </InputAdornment>
                ),
                style: {
                    backgroundColor: 'white',
                    height: '40px',
                    fontSize: 12,
                    paddingRight: 0,
                }
            }}
            fullWidth
        />
    );
};

export default SearchBar;