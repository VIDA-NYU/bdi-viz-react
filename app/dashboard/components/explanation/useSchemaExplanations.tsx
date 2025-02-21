// hooks/useSchemaExplanations.ts
import { useState, useCallback, useEffect } from 'react';
import { Explanation, SchemaMatch } from './types';

interface useSchemaExplanationsProps {
    selectedCandidate: Candidate | undefined,
}

const useSchemaExplanations = ({
    selectedCandidate
}: useSchemaExplanationsProps) => {
    const [matches, setMatches] = useState<SchemaMatch[]>([]);
    const [currentExplanations, setCurrentExplanations] = useState<Explanation[]>([]);
    const [selectedExplanations, setSelectedExplanations] = useState<Explanation[]>([]);
    const [isMatch, setIsMatch] = useState<boolean>(false);
    const [matchingValues, setMatchingValues] = useState<string[][]>([]);
    const [relevantKnowledge, setRelevantKnowledge] = useState<RelevantKnowledge[]>([]);
    
    // Mock function to generate explanations - replace with actual API call later
    const generateExplanations = useCallback((candidateExplanation?: CandidateExplanation) => {
        if (!candidateExplanation) {
            setCurrentExplanations([]);
            setSelectedExplanations([]);
            setIsMatch(false);
            setMatchingValues([]);
            setRelevantKnowledge([]);
            return;
        }
        const explanations: Explanation[] = candidateExplanation?.explanations.map((explanation, index) => {
            return {
                id: index.toString(),
                isMatch: explanation.isMatch,
                type: explanation.type,
                reason: explanation.reason,
                reference: explanation.reference,
                confidence: explanation.confidence
            } as Explanation;
        });
        setIsMatch(candidateExplanation.isMatch);
        if (candidateExplanation.matchingValues) {
            setMatchingValues(candidateExplanation.matchingValues);
        }
        if (candidateExplanation.relevantKnowledge) {
            setRelevantKnowledge(candidateExplanation.relevantKnowledge);
        }
        setCurrentExplanations(explanations);
    }, []);

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
        selectedExplanations,
        matchingValues,
        relevantKnowledge,
        generateExplanations,
        setSelectedExplanations,
        acceptMatch,
        removeMatch
    };
}

export {useSchemaExplanations};