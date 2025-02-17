"use client";

import { useContext, useState } from "react";
import axios from "axios";
import { getCachedResults } from "@/app/lib/heatmap/heatmap-helper";

import { Button, Paper } from "@mui/material";

import LoadingGlobalContext from "@/app/lib/loading/loading-context";
import { Dropzone } from "./file-upload/fileUploadBox";

interface FileUploadingProps {
    callback: (candidates: Candidate[], sourceCluster: SourceCluster[]) => void;
}

const FileUploading = (prop: FileUploadingProps) => {
    const { setIsLoadingGlobal } = useContext(LoadingGlobalContext);
    const [isVisible, setIsVisible] = useState(false);

    const customHeader = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }

    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const file = formData.get("my-file");

        if (file) {
            const fileReader = new FileReader();
            fileReader.onloadend = async (e) => {
                if (e.target) {
                    const csv = e.target.result as string;

                    const formData = new FormData();
                    formData.append("type", "csv_input");
                    formData.append("source_csv", csv);

                    setIsLoadingGlobal(true);
                    axios.post("/api/matching", {
                        ...formData
                    }, {
                        ...customHeader,
                        timeout: 0, // Set timeout to unlimited
                    }).then((response) => {
                        console.log(response);
                        if (response.status === 200) {
                            getCachedResults({
                                callback: prop.callback
                            });
                        }
                        setIsLoadingGlobal(false);
                    })
                }
            };
            fileReader.readAsText(file as Blob);
        }
    }

    return (
        <Paper sx={{ p: 2, width: "100%" }}>
            {isVisible ? (
                <form encType="multipart/form-data" onSubmit={handleOnSubmit}>
                    <Dropzone required name="my-file" />
                    <Button variant="contained" color="primary" type="submit">IMPORT CSV</Button>
                    <Button variant="contained" color="secondary" onClick={() => setIsVisible(false)}>CANCEL</Button>
                </form>
            ) : (
                <Button variant="contained" color="secondary" onClick={() => setIsVisible(true)}>UPLOAD SOURCE FILE</Button>
            )}
        </Paper>
    );
};

export default FileUploading;