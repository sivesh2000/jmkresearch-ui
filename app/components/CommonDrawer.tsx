"use client";
import React, { useEffect, useState, useCallback, memo, use } from "react";
import {
    Box, Button, IconButton, Typography, Switch,
    Divider, FormControl, InputLabel, Select,
    MenuItem as SelectItem, CircularProgress,
    Fade, Modal, Card, CardContent, Paper,
    Menu, MenuItem, TextField, Drawer,
    Chip, Radio, RadioGroup, FormControlLabel, FormLabel,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

interface CommonDrawerProps {
    setOpen?: (state: boolean) => void;
    onClear?: () => void;
    onApply?: (params: any) => any;
    isOpen?: boolean;
    sx?: any;
    columns?: any[];
    buttonOkLabel?: string;
    buttonCancelLabel?: string;
    buttonClearLabel?: string;
    title?: string;
}

const CommonDrawer = memo(function CommonDrawer({ isOpen, setOpen, sx, columns, onApply, onClear, buttonOkLabel, buttonCancelLabel, buttonClearLabel, title }: CommonDrawerProps) {
    const [localData, setLocalData] = useState<any>({});
    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); onApply(localData); }
    return (<div>
        <Drawer anchor="right" open={isOpen} onClose={() => setOpen(false)}
            sx={{
                "& .MuiDrawer-paper": {
                    width: { xs: "100vw", sm: 400 }, maxWidth: "100vw", height: "100vh", overflow: "auto", padding: { xs: 2, sm: 3 }, display: "flex",
                    flexDirection: "column", gap: 2,
                },
            }}>
            {/* Sticky Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, position: "sticky", top: 0, bgcolor: "background.paper", zIndex: 1, mt: 7, }}>
                <Typography variant="h6">{title ? title : 'Filter Options'}</Typography>
                <IconButton onClick={() => setOpen(false)}>
                    <CloseIcon sx={{ color: "black" }} />
                </IconButton>
            </Box>

            {/* Filter Form */}
            <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Status Filter */}
                {columns?.map((column, idx) => {
                    if (column.type) {
                        switch (column.type) {
                            case 'textbox':
                                return (<TextField key={column.field} fullWidth variant="standard" label={column.headerName} margin="normal"
                                    value={localData[column.field] || null}
                                    onChange={(e) => setLocalData({ ...localData, [column.field]: e.target.value })} />);
                            case 'textarea':
                                return (<TextField key={column.field} fullWidth variant="standard" label={column.headerName} margin="normal" multiline rows={4}
                                    value={localData[column.field] || null}
                                    onChange={(e) => setLocalData({ ...localData, [column.field]: e.target.value })} />);
                            case 'dropdown':
                                return (<FormControl fullWidth variant="standard" key={column.field}>
                                    <InputLabel>{column.headerName}</InputLabel>
                                    <Select value={localData[column.field] || null}
                                        onChange={(e) => setLocalData({ ...localData, [column.field]: e.target.value })}>
                                        <SelectItem value="">All</SelectItem>
                                        {column.options && column.options.map((option: any, index: number) => (
                                            <SelectItem key={'op' + index} value={option}>
                                                {column.optionLabelField ? option[column.optionLabelField] : option}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </FormControl>);
                            case 'switch':
                                return (<FormControlLabel label={column.headerName} control={<Switch checked={localData[column.field] || false}
                                    onChange={(e) => setLocalData({ ...localData, [column.field]: e.target.checked })}
                                    className="buttonColor" />} sx={{ mt: 2, mb: 2 }} />)
                            default:
                                return null;
                        }
                    }
                    return null;
                })
                }

                {/* Bottom Buttons */}
                <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, }}>
                    <Button type="submit" variant="contained" className="button-primary button-common" fullWidth>{buttonOkLabel ? buttonOkLabel : 'OK'}</Button>
                    {buttonClearLabel && <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={onClear}>Clear</Button>}
                    {buttonCancelLabel && <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={() => setOpen(false)}>{buttonCancelLabel ? buttonCancelLabel : 'Cancel'}</Button>}
                </Box>
            </form>
        </Drawer>
    </div>);
});

export default CommonDrawer;