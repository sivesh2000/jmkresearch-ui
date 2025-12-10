"use client";
import React, { useEffect, useState, useCallback, memo, use } from "react";
import { Box, Button, IconButton, Typography, Drawer, Tooltip, Chip, Stack } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/Upload';
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";

interface ImportDataProps {
    title: string
}

const ImportData = memo(function ImportData({ title = '' }: ImportDataProps) {
    const [localData, setLocalData] = useState<any>({});
    const [formKey, setFormKey] = useState<string>('frm-0');
    const [isOpen, setOpen] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (files) => setFiles(files)
    });
    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); }

    const handleDelete = (event: any, index: number) => {
        const new1 = files.filter(x=> x.name !== event.name) || [];
        setFiles(new1);
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

                        <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, overflow:'auto'}}>
                            <Stack direction="row" spacing={1}>
                                {files.map((x, i) => <Chip key={'file' + i} label={x.name} onDelete={() => handleDelete(x, i)} />)}
                            </Stack>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, }}>
                            <Button disabled={files.length===0} type="submit" variant="contained" className="button-primary button-common" fullWidth>Import</Button>
                            <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
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