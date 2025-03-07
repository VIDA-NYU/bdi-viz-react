"use client";

import { useContext, useState } from "react";
import axios from "axios";
import { getCachedResults } from "@/app/lib/heatmap/heatmap-helper";

import { Box, Paper, IconButton } from "@mui/material";
import { BasicButton } from "../layout/components";
import UploadFileIcon from '@mui/icons-material/UploadFile';

import SettingsGlobalContext from "@/app/lib/settings/settings-context";
import { Dropzone } from "./file-upload/fileUploadBox";

interface FileUploadingProps {
    callback: (candidates: Candidate[], sourceCluster: SourceCluster[]) => void;
}

const FileUploading: React.FC<FileUploadingProps> = ({ callback }) => {
    const { setIsLoadingGlobal } = useContext(SettingsGlobalContext);
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
                                callback: callback
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
        <>
            {isVisible ? (
                <Paper sx={{ 
                    p: 2, 
                    position: 'fixed', 
                    zIndex: 1300,
                    left: '10px',
                    top: '10px'
                }}>
                    <form encType="multipart/form-data" onSubmit={handleOnSubmit}>
                        <Dropzone required name="my-file" />
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <BasicButton
                                variant="contained"
                                color="primary"
                                type="submit"
                            >Import CSV</BasicButton>
                            <BasicButton
                                variant="outlined"
                                color="info"
                                onClick={() => setIsVisible(false)}
                            >Cancel</BasicButton>
                        </Box>
                    </form>
                </Paper>
            ) : (
                <IconButton
                    color="primary"
                    onClick={() => setIsVisible(true)}
                    sx={{ 
                        borderRadius: 1,
                        py: 0,
                        px: 0,
                        '&:hover': { color: 'primary.dark' }
                    }}
                    title="New matching task"
                >
                    <UploadFileIcon />
                </IconButton>
            )}
        </>
    );
};

export default FileUploading;