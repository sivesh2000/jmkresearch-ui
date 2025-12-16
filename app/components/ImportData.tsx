"use client";
import React, { useEffect, useState, useCallback, memo, use } from "react";
import { Box, Button, IconButton, Typography, Drawer, Tooltip, Chip, Stack } from "@mui/material";
import axiosInstance from "../api/axiosIntance";
import UploadFileIcon from '@mui/icons-material/Upload';
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

interface ImportDataProps {
    title: string,
    template?: string;
    api?: string;
}

const ImportData = memo(function ImportData({ title = '', template, api }: ImportDataProps) {
    const [localData, setLocalData] = useState<any>({});
    const [formKey, setFormKey] = useState<string>('frm-0');
    const [isOpen, setOpen] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (files) => setFiles(files)
    });
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await uploadFirstFile();
    }

    const uploadFirstFile = async () => {
        if (!api) {
            toast.error("Upload URL not provided.");
            return;
        }
        if (!files || files.length === 0) {
            toast.error("Please select a file to proceed with import operation.");
            return;
        }
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const response = await axiosInstance.post(api, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status >= 200 && response.status < 300) {
                if (response.data?.errors) {
                    toast.error(response?.data?.errors.join(", "));
                } else {
                    toast.success("File uploaded successfully!");
                    setFiles([]);
                    setOpen(false);
                }
            } else {
                toast.error("Upload failed");
            }
        } catch (err: any) {
            console.error("Upload error", err);
            toast.error(err?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    const handleDelete = (event: any, index: number) => {
        const new1 = files.filter(x => x.name !== event.name) || [];
        setFiles(new1);
    }

    const downloadTemplate = () => {
        if (!template) return;
        // if template is an absolute URL or starts with '/', use it as-is,
        // otherwise assume it's a filename in public/templates
        let href = template;
        if (!/^([a-z][a-z0-9+.-]*:)|^\//i.test(template)) {
            href = `/templates/${template}`;
        }
        const filename = href.split('/').pop() || template;
        const link = document.createElement('a');
        link.href = encodeURI(href);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const renderDrawer = () => {
        return (<>
            <Drawer anchor="right" open={isOpen} onClose={() => setOpen(false)}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: { xs: "200vw", sm: 500 }, maxWidth: "200vw", height: "100vh", overflow: "auto", padding: { xs: 1, sm: 2 }, display: "flex",
                        flexDirection: "column", gap: 0,
                    },
                }}>
                {/* Sticky Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, position: "sticky", top: 0, bgcolor: "background.paper", zIndex: 1, mt: 8, }}>
                    <Typography variant="h6" sx={{ mb: 0, pb: 0 }}>{title ? title : 'Import Data'}</Typography>
                    {(template) && <Button onClick={downloadTemplate} type="button" variant="outlined" className="button-common buttonColor">
                        <Typography variant="body2" sx={{}}>Download Template</Typography>
                        <DownloadIcon sx={{}} />
                    </Button>}
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon sx={{ color: "black" }} />
                    </IconButton>
                </Box>
                <Box sx={{ height: 'calc(100vh - 100px)', overflow: 'auto', gap: 1 }}>
                    {/* Filter Form */}
                    <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }} key={formKey}>

                        <div {...getRootProps()} style={{ border: "2px dashed #999", padding: 20 }}>
                            <input {...getInputProps()} />
                            <p>Drag & drop files here, or click to upload</p>
                        </div>

                        <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, overflow: 'auto' }}>
                            <Stack direction="row" spacing={1}>
                                {files.map((x, i) => <Chip key={'file' + i} label={x.name} onDelete={() => handleDelete(x, i)} />)}
                            </Stack>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, }}>
                            <Button type="submit" variant="contained" className="button-primary button-common" fullWidth>Import</Button>
                            <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={() => { setFiles([]); setOpen(false) }}>Cancel</Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
        </>);
    }

    return (<>
        <Tooltip title="Import Data" placement="top">
            <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => setOpen(true)}>
                <UploadFileIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        {renderDrawer()}
    </>);
});

export default ImportData;