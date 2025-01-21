"use client";

import axios from "axios";

interface getCachedResultsProps {
    callback: (candidates: Candidate[], sourceCluster: SourceCluster[]) => void;
}

const getCachedResults = (prop: getCachedResultsProps) => {
    return new Promise<void>((resolve, reject) => {
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
                resolve();
            } else {
                reject(new Error("Invalid results format"));
            }
        }).catch((error) => {
            console.error("Error getting cached results:", error);
            reject(error);
        });
    });
};

interface userOperationsProps {
    userOperations: UserOperation[];
    callback: (candidates: Candidate[], sourceCluster?: SourceCluster[]) => void;
}

const applyUserOperations = ({
    userOperations,
    callback
}: userOperationsProps) => {
    try {
        axios.post("/api/user-operation/apply", { userOperations }).then((response) => {
            console.log("applyUserOperations response: ", response);
            if (response.data && response.data.message === "success") {
                getCachedResults({ callback });
            }
        });
    } catch (error) {
        console.error("Error applying user operations:", error);
    }
};


const undoUserOperations = ({
    userOperations,
    callback
}: userOperationsProps) => {
    try {
        axios.post("/api/user-operation/undo", { userOperations }).then((response) => {
            console.log("undoUserOperations response: ", response);
            if (response.data && response.data.message === "success") {
                getCachedResults({ callback });
            }
        });
    } catch (error) {
        console.error("Error undoing user operations:", error);
    }
}


export { getCachedResults, applyUserOperations, undoUserOperations };