"use client";

import axios from "axios";
import http from 'http';
import https from 'https';
import { resolve } from "path";

interface getCachedResultsProps {
    callback: (candidates: Candidate[], sourceCluster: SourceCluster[], matchers: Matcher[]) => void;
}

const getCachedResults = (prop: getCachedResultsProps) => {
    return new Promise<void>((resolve, reject) => {
        const httpAgent = new http.Agent({ keepAlive: true });
        const httpsAgent = new https.Agent({ keepAlive: true });

        axios.get("/api/results", {
            httpAgent,
            httpsAgent,
            timeout: 10000000, // Set timeout to unlimited
        }).then((response) => {
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

                const matchers = results.matchers.map((result: object) => {
                    try {
                        return result as Matcher;
                    } catch (error) {
                        console.error("Error parsing result to Matcher:", error);
                        return null;
                    }
                }).filter((matcher: Matcher | null) => matcher !== null);

                console.log("getCachedResults finished!");
                prop.callback(candidates, sourceClusters, matchers);
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

interface getUniqueValuesProps {
    callback: (sourceUniqueValuesArray: SourceUniqueValues[], targetUniqueValuesArray: TargetUniqueValues[]) => void;
}

const getUniqueValues = (prop: getUniqueValuesProps) => {
    return new Promise<void>((resolve, reject) => {
        const httpAgent = new http.Agent({ keepAlive: true });
        const httpsAgent = new https.Agent({ keepAlive: true });
        axios.get(`/api/unique-values`, {
            httpAgent,
            httpsAgent,
            timeout: 10000000, // Set timeout to unlimited
        }).then((response) => {
            const results = response.data?.results;
            if (results.sourceUniqueValues && Array.isArray(results.sourceUniqueValues) && results.targetUniqueValues && Array.isArray(results.targetUniqueValues)) {
                const sourceUniqueValuesArray = results.sourceUniqueValues.map((result: object) => {
                    try {
                        return result as SourceUniqueValues;
                    } catch (error) {
                        console.error("Error parsing result to SourceUniqueValues:", error);
                        return null;
                    }
                }).filter((sourceUniqueValues: SourceUniqueValues | null) => sourceUniqueValues !== null);

                const targetUniqueValuesArray = results.targetUniqueValues.map((result: object) => {
                    try {
                        return result as TargetUniqueValues;
                    } catch (error) {
                        console.error("Error parsing result to TargetUniqueValues:", error);
                        return null;
                    }
                }).filter((targetUniqueValues: TargetUniqueValues | null) => targetUniqueValues !== null);

                console.log("getUniqueValues finished!");
                prop.callback(sourceUniqueValuesArray, targetUniqueValuesArray);
                resolve();
            } else {
                console.error("Invalid results format");
                reject(new Error("Invalid results format"));
            }
        }).catch((error) => {
            console.error("Error getting unique values:", error);
            reject(error);
        });
    });
}

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


export { getCachedResults, getUniqueValues, applyUserOperations, undoUserOperations };