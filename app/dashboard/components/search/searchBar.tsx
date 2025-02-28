import React, {useState} from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { agentSearchRequest } from '@/app/lib/langchain/agent-helper';


interface SearchBarProps {
    searchResultCallback: (candidates: Candidate[]) => void;
}


const SearchBar: React.FC<SearchBarProps> = ({
    searchResultCallback
}: SearchBarProps) => {
    const [query, setQuery] = useState<string>('');

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            // Call the search result callback with the query
            const candidates = await agentSearchRequest(query);
            if (candidates) {
                console.log("Candidates: ", candidates);
                searchResultCallback(candidates);
            }
        }
    };

    return (
        <TextField
            variant="outlined"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            color='secondary'
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
                endAdornment: query && (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => {
                                setQuery('');
                                searchResultCallback([]); // Reset search results
                            }}
                        >
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                ),
                style: {
                    backgroundColor: 'white',
                    height: '40px',
                    fontSize: 12,
                }
            }}
            fullWidth
        />
    );
};

export default SearchBar;