// hooks/useSchemaLayout.ts
import { useMemo } from 'react';

// Seeded random number generator
class Random {
    private seed: number;
    
    constructor(seed = 12345) {
        this.seed = seed;
    }
    
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

interface LayoutOptions {
    threshold?: number;  // Score threshold for filtering links
    normalizeScores?: boolean;  // Whether to normalize scores to [0,1]
}

export const useSchemaLayout = (
    candidates: Candidate[],
    options: LayoutOptions = {}
) => {
    return useMemo(() => {
        const rng = new Random();
        const sourceColumns = [...new Set(candidates.map(c => c.sourceColumn))];
        const targetColumns = [...new Set(candidates.map(c => c.targetColumn))];

        // Normalize scores to [0,1] if requested
        const scores = candidates.map(c => c.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const normalizedLinks = candidates.map(link => ({
            ...link,
            normalizedScore: options.normalizeScores 
                ? (link.score - minScore) / (maxScore - minScore)
                : link.score
        }));

        // Filter links based on threshold
        const filteredLinks = normalizedLinks.filter(link => 
            link.normalizedScore >= (options.threshold || 0)
        );

        const generateFeatures = () => ({
            speed: rng.random(),
            volume: rng.random(),
            reach: rng.random(),
            quality: rng.random()
        });

        const getCluster = (name: string) => {
            if(name.length <= 1) return 'default';
            const prefix = name.split('_')[0];
            return prefix || 'default';
        };

        const createRandomLayout = (nodes: string[], bounds: {width: number, height: number}) => {
            const clusterMap = new Map<string, {x: number, y: number}>();
            
            return nodes.map(name => {
                const cluster = getCluster(name);
                
                if (!clusterMap.has(cluster)) {
                    clusterMap.set(cluster, {
                        x: (rng.random() - 0.5) * bounds.width * 0.8,
                        y: (rng.random() - 0.5) * bounds.height * 0.8
                    });
                }
                
                const basePos = clusterMap.get(cluster)!;
                const jitter = 50;
                
                return {
                    name,
                    cluster,
                    features: generateFeatures(),
                    coordinates: {
                        x: basePos.x + (rng.random() - 0.5) * jitter,
                        y: basePos.y + (rng.random() - 0.5) * jitter
                    }
                };
            });
        };

        const bounds = { width: 150, height: 150 };
        const sourceNodes = createRandomLayout(sourceColumns, bounds);
        const targetNodes = createRandomLayout(targetColumns, bounds);

        return {
            sourceNodes,
            targetNodes,
            links: filteredLinks,
            scoreRange: {
                min: minScore,
                max: maxScore
            }
        };
    }, [candidates, options.threshold, options.normalizeScores]);
};

// Add a custom hook for managing the threshold
import { useState, useCallback } from 'react';

export const useScoreThreshold = (initialThreshold = 0) => {
    const [threshold, setThreshold] = useState(initialThreshold);

    const handleThresholdChange = useCallback((_event: Event, newValue: number | number[]) => {
        setThreshold(Array.isArray(newValue) ? newValue[0] : newValue);
    }, []);

    return {
        threshold,
        setThreshold,
        handleThresholdChange
    };
};