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

export const useSchemaLayout = (candidates: Candidate[]) => {
    return useMemo(() => {
        const rng = new Random();
        const sourceColumns = [...new Set(candidates.map(c => c.sourceColumn))];
        const targetColumns = [...new Set(candidates.map(c => c.targetColumn))];

        const generateFeatures = () => ({
            speed: rng.random(),
            volume: rng.random(),
            reach: rng.random(),
            quality: rng.random()
        });

        const getCluster = (name: string) => {
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
            links: candidates
        };
    }, [candidates]);
};