"use client";

import { useState } from "react";
import axios from "axios";

import { Container, TextField, Button } from "@mui/material";


interface ChatBoxProp {
    callback: (candidates: Candidate[]) => void;
}

const ChatBox = (prop: ChatBoxProp) => {
    const [messages] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");

    const handleSendMessage = () => {
        axios.post("/api/agent", {
            prompt: message
        }).then(res => {
            console.log(res.data);

            axios.get("/api/results").then((response) => {
                const results = response.data?.results;
                if (results.candidates && Array.isArray(results.candidates)) {
                    const candidates = results.map((result: object) => {
                        try {
                            return result as Candidate;
                        } catch (error) {
                            console.error("Error parsing result to Candidate:", error);
                            return null;
                        }
                    }).filter((candidate: Candidate | null) => candidate !== null);
                    prop.callback(candidates);
                }
            });
        });
    };


    return (
        <Container>
            <div>
                {messages.map((msg, i) => (
                    <div key={i}>
                        {msg}
                    </div>
                ))}
            </div>
            <TextField
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
            />
            <Button
                onClick={handleSendMessage}
                variant="contained"
                color="primary"
            >
                Send
            </Button>
        </Container>
    );
}

export default ChatBox;