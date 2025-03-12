// hooks/useSchemaExplanations.ts
import { useState, useCallback } from 'react';

const useSchemaExplanations = () => {
    const [currentExplanations, setCurrentExplanations] = useState<Explanation[]>([]);
    const [thumbUpExplanations, setThumbUpExplanations] = useState<string[]>([]);
    const [thumbDownExplanations, setThumbDownExplanations] = useState<string[]>([]);
    const [selectedExplanations, setSelectedExplanations] = useState<Explanation[]>([]);
    const [isMatch, setIsMatch] = useState<boolean>(false);
    const [valueMappings, setValueMappings] = useState<SuggestedValueMappings[]>([]);
    const [relevantKnowledge, setRelevantKnowledge] = useState<RelevantKnowledge[]>([]);
    const [relatedOuterSources, setRelatedOuterSources] = useState<RelatedSource[]>([]);
    
    // Mock function to generate explanations - replace with actual API call later
    const generateExplanations = useCallback((candidateExplanation?: CandidateExplanation) => {
        if (!candidateExplanation) {
            setCurrentExplanations([]);
            setSelectedExplanations([]);
            setIsMatch(false);
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
        
        if (candidateExplanation.relevantKnowledge) {
            setRelevantKnowledge(candidateExplanation.relevantKnowledge);
        }
        setCurrentExplanations(explanations);
    }, []);

    const updateValueMappings = useCallback((newValueMapping: SuggestedValueMappings) => {
        setValueMappings((prevValueMappings) => {
            const exists = prevValueMappings.some(
                (valueMapping) =>
                    valueMapping.sourceColumn === newValueMapping.sourceColumn &&
                    valueMapping.targetColumn === newValueMapping.targetColumn
            );
            if (exists) {
                return prevValueMappings.map((valueMapping) =>
                    valueMapping.sourceColumn === newValueMapping.sourceColumn &&
                    valueMapping.targetColumn === newValueMapping.targetColumn
                        ? newValueMapping
                        : valueMapping
                );
            } else {
                return [...prevValueMappings, newValueMapping];
            }
        });
    }, []);

    return {
        isMatch,
        currentExplanations,
        selectedExplanations,
        thumbUpExplanations,
        thumbDownExplanations,
        valueMappings,
        relevantKnowledge,
        relatedOuterSources,
        setIsMatch,
        generateExplanations,
        setSelectedExplanations,
        setThumbUpExplanations,
        setThumbDownExplanations,
        setRelatedOuterSources,
        updateValueMappings,
    };
}

export {useSchemaExplanations};