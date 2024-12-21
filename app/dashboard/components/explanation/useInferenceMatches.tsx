// components/SchemaExplanation/useInferredMatches.ts
import { useState, useCallback } from 'react';
import { InferredMatch } from './InferenceMatches';
import { Explanation } from './types';


interface UseInferredMatchesProps {
    sourceColumn?: string;
    allSourceColumns: string[];
    allTargetColumns: string[];
}

const useInferredMatches = ({
    sourceColumn,
    allSourceColumns,
    allTargetColumns
}: UseInferredMatchesProps) => {
    const [inferredMatches, setInferredMatches] = useState<InferredMatch[]>([]);

    const inferMatchesFromPattern = useCallback((pattern: string, confidence: number) => {
        const matches: InferredMatch[] = [];
        
        // Skip if no source column selected
        if (!sourceColumn) return matches;

        // Get the pattern from the source column
        const sourcePattern = sourceColumn.toLowerCase();
        const sourceTokens = sourcePattern.split('_');

        // Look for similar patterns in other columns
        allSourceColumns.forEach(source => {
            if (source === sourceColumn) return;

            const targetColumns = allTargetColumns.filter(target => {
                const targetLower = target.toLowerCase();
                
                // Check for pattern matches based on the explanation type
                if (pattern === 'token') {
                    const targetTokens = targetLower.split('_');
                    return sourceTokens.some(token => 
                        targetTokens.some(targetToken => 
                            targetToken.includes(token) || token.includes(targetToken)
                        )
                    );
                }
                
                if (pattern === 'suffix') {
                    return targetLower.endsWith('_at_index') || 
                           targetLower.endsWith('_index') ||
                           targetLower.endsWith('_date');
                }

                return false;
            });

            targetColumns.forEach(target => {
                matches.push({
                    sourceColumn: source,
                    targetColumn: target,
                    confidence: confidence * 0.8 // Slightly lower confidence for inferred matches
                });
            });
        });

        return matches;
    }, [sourceColumn, allSourceColumns, allTargetColumns]);
    
    const handleExplanationsChange = useCallback((explanations: Explanation[]) => {
        let newMatches: InferredMatch[] = [];

        explanations.forEach(explanation => {
            switch (explanation.type) {
                case 'token':
                    newMatches = [...newMatches, ...inferMatchesFromPattern('token', explanation.confidence)];
                    break;
                case 'semantic':
                    newMatches = [...newMatches, ...inferMatchesFromPattern('suffix', explanation.confidence)];
                    break;
                // Add more patterns based on explanation types
            }
        });

        // Remove duplicates and sort by confidence
        newMatches = newMatches
            .filter((match, index, self) => 
                index === self.findIndex(m => 
                    m.sourceColumn === match.sourceColumn && 
                    m.targetColumn === match.targetColumn
                )
            )
            .sort((a, b) => b.confidence - a.confidence);

        setInferredMatches(newMatches);
    }, [inferMatchesFromPattern]);

    const acceptInferredMatch = useCallback((match: InferredMatch) => {
        setInferredMatches(prev => 
            prev.filter(m => 
                m.sourceColumn !== match.sourceColumn || 
                m.targetColumn !== match.targetColumn
            )
        );
        // You can add callback to parent component here to handle the accepted match
    }, []);

    const rejectInferredMatch = useCallback((match: InferredMatch) => {
        setInferredMatches(prev => 
            prev.filter(m => 
                m.sourceColumn !== match.sourceColumn || 
                m.targetColumn !== match.targetColumn
            )
        );
    }, []);

    return {
        inferredMatches,
        handleExplanationsChange,
        acceptInferredMatch,
        rejectInferredMatch
    };
}

export {useInferredMatches};
