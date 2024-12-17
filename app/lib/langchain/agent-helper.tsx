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


export { userOperationRequest };