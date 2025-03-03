// hooks/useSchemaExplanations.ts
import { useState, useCallback } from 'react';

const useSchemaExplanations = () => {
    const [currentExplanations, setCurrentExplanations] = useState<Explanation[]>([]);
    const [thumbUpExplanations, setThumbUpExplanations] = useState<string[]>([]);
    const [thumbDownExplanations, setThumbDownExplanations] = useState<string[]>([]);
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
                id: explanation.id,
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

    return {
        isMatch,
        currentExplanations,
        selectedExplanations,
        thumbUpExplanations,
        thumbDownExplanations,
        matchingValues,
        relevantKnowledge,
        setIsMatch,
        generateExplanations,
        setSelectedExplanations,
        setThumbUpExplanations,
        setThumbDownExplanations,
    };
}

export {useSchemaExplanations};