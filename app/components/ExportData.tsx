"use client";
import React, { memo, useState } from "react";
import {
    IconButton, Tooltip,
    Box, Button, Typography, Switch,
    Divider, FormControl, InputLabel, Select,
    MenuItem as SelectItem, CircularProgress,
    Fade, Modal, Card, CardContent, Paper,
    Menu, MenuItem, TextField, Drawer,
    Chip, Radio, RadioGroup, FormControlLabel, FormLabel,
    Accordion, AccordionActions, AccordionSummary, AccordionDetails,
    Stack,
    ListItemText, Checkbox,
    List, ListItem, ListItemButton, ListItemIcon
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { exportToExcel } from "../utils/functions";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../api/axiosIntance";
import { toast } from "react-toastify";

interface ExportDataProps {
    dataArray: any[];
    type: any;
    columns: any[];
    api: string;
    setOpen?: (open: boolean) => void;
    isOpen?: boolean;
    title?: string;
}


const ExportData = memo(function ExportData({ dataArray, type, columns, title, api }: ExportDataProps) {
    const [localData, setLocalData] = useState<any>({});
    const [formKey, setFormKey] = useState<string>('frm-0');
    const [isOpen, setOpen] = useState<boolean>(false);
    const [viewCols, setViewCols] = useState(false);
    const [checked, setChecked] = useState<any[]>(columns || []);
    let count = 0;
    const handleToggle = (value: any) => {
        const isExist = checked.find(x => x.field === value.field);
        if (isExist) {
            setChecked(checked.filter(x => x.field !== value.field));
        } else {
            setChecked([...checked, value]);
        }
    };

    const selectColumn = () => {
        // setSelCol?.(checked);
        setViewCols?.(false);
    }



    const isChecked = (e: any): boolean => {
        const row = checked.find(x => x.field === e.field)
        return row !== undefined;
    };
    const onClickHandler = () => {
        setOpen(!isOpen);
        // exportToExcel(dataArray, columns, "download.xlsx");
    }

    const resetForm = () => {
        setLocalData({});
        const randumNumber = Math.random();
        setFormKey('frm-' + randumNumber);
    }

    const downloadCsv = (rows: any[], cols: any[], filename: string) => {
        if (!rows || rows.length === 0) return;
        const headers = cols.map(c => c.headerName ?? c.field);
        const fields = cols.map(c => c.field);

        const escapeCsv = (val: any) => {
            if (val === null || val === undefined) return '';
            let str = String(val);
            if (str.indexOf('"') !== -1) str = str.replace(/"/g, '""');
            if (str.indexOf(',') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('"') !== -1) {
                return `"${str}"`;
            }
            return str;
        };

        const getFieldValue = (obj: any, field: string) => {
            // support dot notation like 'user.name'
            return field.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
        };

        const csvRows = [];
        csvRows.push(headers.map(h => escapeCsv(h)).join(','));
        for (const row of rows) {
            const values = fields.map(f => escapeCsv(getFieldValue(row, f)));
            csvRows.push(values.join(','));
        }
        const csvContent = csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleApply = async (e: any) => {
        if (count > 0) return; // prevent multiple clicks
        e.preventDefault();
        count++;
        try {
            const columnsToExport = checked.map(col => col.field);
            if (columnsToExport.length === 0) {
                // nothing selected, abort
                return;
            }
            const queryParam = columnsToExport.map(col => `${encodeURIComponent(col)}`).join(',');
            const url = api.includes('?') ? `${api}&columns=${queryParam}` : `${api}?columns=${queryParam}`;

            const response = await axiosInstance.get(url);
            if (response.status === 200 || response.status === 304) {
                const data = response?.data;
                if (!data || data.length === 0) {
                    // no data to export
                    toast.info('No data available to export');
                    return;
                }
                // Use checked columns' headerName and field order for CSV
                const filename = `${title ? title.replace(/\s+/g, '_') : 'export'}.csv`;
                const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                // close drawer after export
                setOpen(false);
            }
        } catch (error) {
            // handle or log error if needed
            console.error('Export failed', error);
        }
    };

    const handleApply1 = async () => {
        // onApply?.(localData) 
        const columnsToExport = checked.map(col => col.field);
        const queryParam = columnsToExport.map(col => `columns=${col}`).join('&');
        const url = api + '?' + queryParam;
        const response = await axiosInstance.get(api);
        if (response.status === 200) {
            const data = response?.data;

        };
    }

    // const handleClear = () => { onClear?.() };

    const handleClose = () => {
        setLocalData({});
        const randumNumber = Math.random();
        setFormKey('frm-' + randumNumber);
        setOpen?.(false)
    };

    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); handleApply(); }

    const renderColumnSelector = (availColumns: any[] | undefined) => {
        {
            if (!availColumns || availColumns.length === 0) return null;
            return (<Box sx={{ mb: 2 }}>
                <InputLabel>Available Columns</InputLabel>
                <List sx={{ width: '100%', bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 300, '& ul': { padding: 0 }, }}>
                    {availColumns.map((e: any, tIndex: number) => {
                        const labelId = `checkbox-list-label-${e.field}`;
                        return (
                            <ListItem key={e.field} disablePadding>
                                <ListItemButton onClick={() => handleToggle(e)} dense>
                                    <ListItemIcon>
                                        <Checkbox edge="start" checked={isChecked(e)} tabIndex={tIndex} disableRipple inputProps={{ "aria-labelledby": labelId }} />
                                    </ListItemIcon>
                                    <ListItemText id={labelId} primary={e.headerName} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>);
        }
    }

    return (<>
        <Tooltip title="Export to excel" placement="top">
            <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={onClickHandler}>
                <DownloadIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        <Drawer anchor="right" open={isOpen} onClose={() => handleClose()}
            sx={{
                "& .MuiDrawer-paper": {
                    width: { xs: "200vw", sm: 500 }, maxWidth: "200vw", height: "100vh", overflow: "auto", padding: { xs: 1, sm: 2 }, display: "flex",
                    flexDirection: "column", gap: 0,
                },
            }}>
            {/* Sticky Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, position: "sticky", top: 0, bgcolor: "background.paper", zIndex: 1, mt: 8, }}>
                <Typography variant="h6" sx={{ mb: 0, pb: 0 }}>{title ? title : 'Export Data'}</Typography>
                <IconButton onClick={() => handleClose()}>
                    <CloseIcon sx={{ color: "black" }} />
                </IconButton>
            </Box>
            <hr />
            <Box sx={{ height: 'calc(100vh - 100px)', overflow: 'auto', gap: 1 }}>
                {/* Filter Form */}
                {renderColumnSelector(columns)}
                {columns && <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }} key={formKey}>
                    {/* {renderColumnSelector(availableColumns)} */}
                    <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, }}>
                        <Button type="submit" variant="contained" className="button-primary button-common" fullWidth onClick={handleApply}>Export</Button>
                        <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={handleClose}>Cancel</Button>
                    </Box>
                </form>}
            </Box>
        </Drawer>
    </>);
});

export default ExportData;