"use client";
import React, { useState, memo } from "react";
import { GridColDef, GridDownloadIcon } from "@mui/x-data-grid";
import {
    Box, Button, IconButton, Menu, MenuItem, Modal, TextField, Typography,
    FormControl, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Chip, InputLabel, Select, ListItemText, Checkbox,
    List, ListItem, ListItemButton, ListItemIcon, Tooltip
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";


interface ColumnSelectorProps {
    options: any[];
    selCol: any[];
    setSelCol?(cols: any[]): void;
}


const ColumnSelector = memo(function ColumnSelector({ options, selCol, setSelCol }: ColumnSelectorProps) {
    const [viewCols, setViewCols] = useState(false);
    const [checked, setChecked] = useState<any[]>(selCol || []);

    const handleToggle = (value: any) => {
        console.log("Value", checked)
        const isExist = checked.find(x => x.field === value.field);
        if (isExist) {
            setChecked(checked.filter(x => x.field !== value.field));
        } else {
            setChecked([...checked, value]);
        }

    };

    const selectColumnHandler = (checkedColumn: any[] = []) => {
        setSelCol?.(checkedColumn);
    }

    return (
        <>
            <Tooltip title="Columns selection" placement="top">
                <IconButton size="small" sx={{ background: "#dedede", mr: 1, "&:hover": { color: "red" } }} onClick={() => setViewCols(true)}>
                    <SettingsIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Modal open={viewCols} onClose={() => setViewCols(false)}>
                <Box sx={{
                    position: "absolute", top: { xs: 0, sm: "50%" }, left: { xs: 0, sm: "50%" }, transform: { xs: "none", sm: "translate(-50%, -50%)" },
                    width: { xs: "100vw", sm: 400 }, height: { xs: "100vh", sm: "auto" }, bgcolor: "background.paper", boxShadow: 24, p: { xs: 2, sm: 4 },
                    borderRadius: { xs: 0, sm: 2 }, overflow: "auto",
                }}>
                    <Typography variant="h6" mb={3}>Select Columns</Typography>

                    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 300, '& ul': { padding: 0 }, }}>
                        {options.map((e: GridColDef) => {
                            const labelId = `checkbox-list-label-${e.field}`;
                            return (
                                <ListItem key={e.field} disablePadding>
                                    <ListItemButton onClick={() => handleToggle(e)} dense>
                                        <ListItemIcon>
                                            <Checkbox edge="start" checked={checked.includes(e)} tabIndex={-1} disableRipple inputProps={{ "aria-labelledby": labelId }} />
                                        </ListItemIcon>
                                        <ListItemText id={labelId} primary={e.headerName} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>

                    <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                        <Button className="button-common button-primary" variant="contained" fullWidth onClick={() => {
                            console.log("Selected", checked)
                            selectColumnHandler(checked);
                            // setViewCols(false);
                        }}>OK</Button>
                        <Button className="button-common buttonColor" variant="outlined" fullWidth onClick={() => setViewCols(false)} >Cancel</Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
});

export default ColumnSelector;