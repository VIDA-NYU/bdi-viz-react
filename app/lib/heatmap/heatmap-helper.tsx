"use client";

import axios from "axios";

interface getCachedResultsProps {
    callback: (candidates: Candidate[], sourceCluster: SourceCluster[]) => void;
}

const getCachedResults = (prop: getCachedResultsProps) => {
    try {
        axios.get("/api/results").then((response) => {
            const results = response.data?.results;
            if (results.candidates && Array.isArray(results.candidates) && results.sourceClusters && Array.isArray(results.sourceClusters)) {
                const candidates = results.candidates.map((result: object) => {
                    try {
                        return result as Candidate;
                    } catch (error) {
                        console.error("Error parsing result to Candidate:", error);
                        return null;
                    }
                }).filter((candidate: Candidate | null) => candidate !== null);

                const sourceClusters = results.sourceClusters.map((result: object) => {
                    try {
                        return result as SourceCluster;
                    } catch (error) {
                        console.error("Error parsing result to SourceCluster:", error);
                        return null;
                    }
                }).filter((sourceCluster: SourceCluster | null) => sourceCluster !== null);

                console.log("getCachedResults: ", candidates, sourceClusters);
                prop.callback(candidates, sourceClusters);
            }
        });
    } catch (error) {
        console.error("Error getting cached results:", error);
    }
};


export { getCachedResults };