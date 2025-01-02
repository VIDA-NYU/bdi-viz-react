// hooks/useSchemaExplanations.ts
import { useState, useCallback, useEffect } from 'react';
import { Explanation, SchemaMatch } from './types';

const useSchemaExplanations = (
    selectedCandidate: Candidate | undefined,
) => {
    const [matches, setMatches] = useState<SchemaMatch[]>([]);
    const [currentExplanations, setCurrentExplanations] = useState<Explanation[]>([]);
    const [isMatch, setIsMatch] = useState<boolean>(false);
    const [matchingValues, setMatchingValues] = useState<string[][]>([]);
    const [relativeKnowledge, setRelativeKnowledge] = useState<RelativeKnowledge[]>([]);
    
    // Mock function to generate explanations - replace with actual API call later
    const generateExplanations = useCallback((candidateExplanation?: CandidateExplanation) => {
        if (!candidateExplanation) return;
        const explanations: Explanation[] = candidateExplanation?.explanations.map((explanation, index) => {
            return {
                id: index.toString(),
                type: explanation.type,
                content: explanation.content,
                confidence: explanation.confidence
            } as Explanation;
        });
        setIsMatch(candidateExplanation.isMatch);
        if (candidateExplanation.matchingValues) {
            setMatchingValues(candidateExplanation.matchingValues);
        }
        if (candidateExplanation.relativeKnowledge) {
            setRelativeKnowledge(candidateExplanation.relativeKnowledge);
        }
        setCurrentExplanations(explanations);
    }, []);


    useEffect(() => {
        if (selectedCandidate){
            generateExplanations();
        }
    }, [
        selectedCandidate
    ]);

    const acceptMatch = useCallback((
        // sourceColumn: string,
        // targetColumn: string,
        selectedExplanations: Explanation[]
    ) => {
        if (!selectedCandidate) return;
        const sourceColumn = selectedCandidate.sourceColumn;
        const targetColumn = selectedCandidate.targetColumn
        const newMatch: SchemaMatch = {
            sourceColumn,
            targetColumn,
            selectedExplanations,
            score: Math.max(...selectedExplanations.map(e => e.confidence))
        };
        
        setMatches(prev => [...prev, newMatch]);
        setCurrentExplanations([]);
    }, [selectedCandidate]);

    const removeMatch = useCallback((sourceColumn: string, targetColumn: string) => {
        setMatches(prev => 
            prev.filter(m => 
                m.sourceColumn !== sourceColumn || m.targetColumn !== targetColumn
            )
        );
    }, []);

    return {
        matches,
        isMatch,
        currentExplanations,
        matchingValues,
        relativeKnowledge,
        generateExplanations,
        acceptMatch,
        removeMatch
    };
}

export {useSchemaExplanations};