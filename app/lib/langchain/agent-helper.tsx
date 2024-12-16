"use client";

import axios from "axios";


const userOperationRequest = async (userOperation: UserOperation) => {
    try {
        const response = await axios.post("/api/agent/diagnose", userOperation);
        console.log(response.data);

    } catch (error) {
        console.error("Error sending user operation:", error);
    }
};


export { userOperationRequest };