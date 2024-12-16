"use client";

import { useState } from "react";
import axios from "axios";
import { getCachedResults } from "@/app/lib/heatmap/heatmap-helper";

import { Button, Container } from "@mui/material";

interface FileUploadingProps {
    callback: (candidates: Candidate[], sourceCluster: SourceCluster[]) => void;
}

const FileUploading = (prop: FileUploadingProps) => {
    const [file, setFile] = useState<File | null>(null);

    const customHeader = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleOnSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (file) {
            const fileReader = new FileReader();
            fileReader.onloadend = async (e) => {
                if (e.target) {
                    const csv = e.target.result as string;
                    
                    const formData = new FormData();
                    formData.append("type", "csv_input");
                    formData.append("source_csv", csv);
                    
                    axios.post("/api/matching", formData, {
                        ...customHeader,
                        timeout: 10000000, // 10 seconds timeout
                    }).then((response) => {
                        console.log(response);
                        if (response.status === 200) {
                            getCachedResults({
                                callback: prop.callback
                            });
                        }
                    })
                }
            };
            fileReader.readAsText(file);
        }
    }

    return (
        <Container>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
            />
            {file && <p>Selected file: {file.name}</p>}
            <Button onClick={(e) => {handleOnSubmit(e);}} >IMPORT CSV</Button>
        </Container>
    );
};

export default FileUploading;