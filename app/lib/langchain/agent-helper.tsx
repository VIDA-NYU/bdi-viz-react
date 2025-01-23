"use client";

import axios from "axios";
import http from 'http';
import https from 'https';

const candidateExplanationRequest = async (candidate: Candidate): Promise<CandidateExplanation | undefined> => {
    try {
        const httpAgent = new http.Agent({ keepAlive: true });
        const httpsAgent = new https.Agent({ keepAlive: true });

        const resp = await axios.post("/api/agent/explain", candidate, {
            httpAgent,
            httpsAgent,
            timeout: 10000000, // Set timeout to unlimited
        });
        console.log("candidateExplanationRequest: ", resp.data);
        const { is_match, explanations, matching_values, relative_knowledge } = resp.data;
        let explanationObjects: ExplanationObject[] = [];
        if (explanations && explanations.length > 0) {
            explanationObjects = explanations.map((e: object) => {
                try {
                    return e as ExplanationObject;
                } catch (error) {
                    console.error("Error parsing explanation to ExplanationObject:", error);
                    return null;
                }
            }).filter((e: ExplanationObject | null) => e !== null);
        }
        let relativeKnowledgeObjects: RelativeKnowledge[] = [];
        if (relative_knowledge && relative_knowledge.length > 0) {
            relativeKnowledgeObjects = relative_knowledge.map((rk: object) => {
                try {
                    return rk as RelativeKnowledge;
                } catch (error) {
                    console.error("Error parsing relative knowledge to RelativeKnowledge:", error);
                    return null;
                }
            }).filter((rk: RelativeKnowledge | null) => rk !== null);
        }
        const candidateExplanation: CandidateExplanation = {
            isMatch: is_match,
            explanations: explanationObjects,
            matchingValues: matching_values,
            relativeKnowledge: relativeKnowledgeObjects,
        };

        return candidateExplanation;
    } catch (error) {
        console.error("Error sending candidate explanation request:", error);
    }
};

const agentSuggestionsRequest = async (userOperation: UserOperation, explanations: ExplanationObject[]): Promise<AgentSuggestions | undefined> => {
    try {
        const httpAgent = new http.Agent({ keepAlive: true });
        const httpsAgent = new https.Agent({ keepAlive: true });

        const resp = await axios.post("/api/agent/suggest", {
            userOperation,
            explanations,
        }, {
            httpAgent,
            httpsAgent,
            timeout: 10000000, // Set timeout to unlimited
        });
        console.log("agentSuggestionsRequest: ", resp.data);

        const { actions } = resp.data;
        let agentActions: AgentAction[] = [];
        if (actions && actions.length > 0) {
            agentActions = actions.map((a: object) => {
                try {
                    return a as AgentAction;
                } catch (error) {
                    console.error("Error parsing action to AgentAction:", error);
                    return null;
                }
            }).filter((a: AgentAction | null) => a !== null);
        }

        const agentSuggestions: AgentSuggestions = {
            actions: agentActions,
        };

        return agentSuggestions;

    } catch (error) {
        console.error("Error sending agent suggestions request:", error);
    }
}

const agentActionRequest = async (reaction: UserReaction): Promise<ActionResponse[] | undefined> => {
    try {
        const httpAgent = new http.Agent({ keepAlive: true });
        const httpsAgent = new https.Agent({ keepAlive: true });
        
        const resp = await axios.post("/api/agent/apply", reaction, {
            httpAgent,
            httpsAgent,
            timeout: 10000000, // Set timeout to unlimited
        });
        console.log("agentActionRequest: ", resp.data);
        
        // let actionResponses = [];
        if (resp.data && resp.data.length > 0) {
            // actionResponses = resp.data.map((ar: object) => {
            //     try {
            //         const {status, response, action, target_candidates} = ar;
            //         if (target_candidates && target_candidates.length > 0) {
            //             target_candidates.map((tc: object) => {
            //                 try {
            //                     return tc as Candidate;
            //                 } catch (error) {
            //                     console.error("Error parsing target candidate to Candidate:", error);
            //                     return null;
            //                 }
            //             }).filter((tc: Candidate | null) => tc !== null);
            //         }
            //         return ar as ActionResponse;
            //     } catch (error) {
            //         console.error("Error parsing action response to ActionResponse:", error);
            //         return null;
            //     }
            // }).filter((ar: ActionResponse | null) => ar !== null);
            console.log("actionResponses: ", resp.data);
            return resp.data;
        }
    } catch (error) {
        console.error("Error sending agent action request:", error);
    }
}


export { candidateExplanationRequest, agentSuggestionsRequest, agentActionRequest };