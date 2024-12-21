// hooks/useSchemaExplanations.ts
import { useState, useCallback } from 'react';
import { Explanation, SchemaMatch } from './types';

const useSchemaExplanations = () => {
    const [matches, setMatches] = useState<SchemaMatch[]>([]);
    const [currentExplanations, setCurrentExplanations] = useState<Explanation[]>([]);
    
    // Mock function to generate explanations - replace with actual API call later
    const generateExplanations = useCallback((sourceColumn: string, targetColumn: string) => {
        const mockExplanations: Explanation[] = [
            {
                id: '1',
                type: 'name',
                content: `Direct name similarity between "${sourceColumn}" and "${targetColumn}"`,
                confidence: 0.8
            },
            {
                id: '2',
                type: 'token',
                content: `Common tokens found: "${sourceColumn.split('_').join(', ')}"`,
                confidence: 0.6
            },
            {
                id: '3',
                type: 'value',
                content: 'Similar value distributions detected in both columns',
                confidence: 0.75
            },
            {
                id: '4',
                type: 'semantic',
                content: `"${sourceColumn}" is semantically related to "${targetColumn}"`,
                confidence: 0.65
            }
        ];
        setCurrentExplanations(mockExplanations);
    }, []);

    const acceptMatch = useCallback((
        sourceColumn: string,
        targetColumn: string,
        selectedExplanations: Explanation[]
    ) => {
        const newMatch: SchemaMatch = {
            sourceColumn,
            targetColumn,
            selectedExplanations,
            score: Math.max(...selectedExplanations.map(e => e.confidence))
        };
        
        setMatches(prev => [...prev, newMatch]);
        setCurrentExplanations([]);
    }, []);

    const removeMatch = useCallback((sourceColumn: string, targetColumn: string) => {
        setMatches(prev => 
            prev.filter(m => 
                m.sourceColumn !== sourceColumn || m.targetColumn !== targetColumn
            )
        );
    }, []);

    return {
        matches,
        currentExplanations,
        generateExplanations,
        acceptMatch,
        removeMatch
    };
}

export {useSchemaExplanations};