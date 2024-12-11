"use client";

import { useState } from "react";
import axios from "axios";

import { Container, TextField, Button } from "@mui/material";

const ChatBox = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");

    const handleSendMessage = () => {
        axios.post("/api/agent", {
            prompt: message
        }).then(res => {
            console.log(res.data);
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