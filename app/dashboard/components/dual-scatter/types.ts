// types/index.ts
export interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
    matcher?: string;
}

export interface Column {
    name: string;
    cluster: string;
    features: {
        speed: number;
        volume: number;
        reach: number;
        quality: number;
    };
    coordinates: {
        x: number;
        y: number;
    };
}


