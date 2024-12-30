"use client";

import axios from "axios";


const userOperationRequest = async (userOperation: UserOperation): Promise<AgentDiagnosis | undefined> => {
    try {
        const resp = await axios.post("/api/agent/diagnose", userOperation);
        console.log(resp.data);
        const { diagnosis, response, status } = resp.data;
        let diagnosisObjects: DiagnoseObject[] = [];
        if (diagnosis && diagnosis.length > 0) {
            diagnosisObjects = diagnosis.map((d: object) => {
                try {
                    return d as DiagnoseObject;
                } catch (error) {
                    console.error("Error parsing diagnosis to Diagnosis:", error);
                    return null;
                }
            }).filter((d: DiagnoseObject | null) => d !== null);
        }

        const agentDiagnosis: AgentDiagnosis = {
            diagnosis: diagnosisObjects,
            response,
            status,
        };

        return agentDiagnosis;

    } catch (error) {
        console.error("Error sending user operation:", error);
    }
};

const candidateExplanationRequest = async (candidate: Candidate): Promise<CandidateExplanation | undefined> => {
    try {
        const resp = await axios.post("/api/agent/explain", candidate);
        console.log(resp.data);
        const { is_match, explanations, matching_values } = resp.data;
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
        const candidateExplanation: CandidateExplanation = {
            isMatch: is_match,
            explanations: explanationObjects,
            matchingValues: matching_values,
        };

        return candidateExplanation;
    } catch (error) {
        console.error("Error sending candidate explanation request:", error);
    }
};


export { userOperationRequest, candidateExplanationRequest };