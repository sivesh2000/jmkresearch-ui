"use client";
import React, { useState, memo, use, useEffect } from "react";
import {
    Box, Button, IconButton, Typography, Switch,
    Divider, FormControl, InputLabel, Select,
    MenuItem as SelectItem, CircularProgress,
    Fade, Modal, Card, CardContent, Paper,
    Menu, MenuItem, TextField, Drawer,
    Chip, Radio, RadioGroup, FormControlLabel, FormLabel,
    Accordion, AccordionActions, AccordionSummary, AccordionDetails,
    Stack,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from "@mui/icons-material/Close";

type ObjectViewerProps = {
    data: Record<string, any>;
    label?: string;
    skipKeys?: string[];
};

interface CommonDrawerProps {
    setOpen?(state: boolean): void;
    onClear?(): void;
    onApply?(params: any): void;
    isOpen?: boolean;
    sx?: any;
    columns?: any[];
    buttonOkLabel?: string;
    buttonCancelLabel?: string;
    buttonClearLabel?: string;
    title?: string;
    reset?: boolean;
    defaultValue?: any;
}

const Root = styled('div')(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    color: (theme.vars || theme).palette.text.secondary,
    '& > :not(style) ~ :not(style)': {
        marginTop: theme.spacing(1),
    },
}));

const CommonDrawer = memo(function CommonDrawer({ defaultValue, reset = true, isOpen, setOpen, sx, columns, onApply, onClear, buttonOkLabel, buttonCancelLabel, buttonClearLabel, title }: CommonDrawerProps) {
    const [localData, setLocalData] = useState<any>({});
    const [formKey, setFormKey] = useState<string>('frm-0');

    useEffect(() => {
        if (defaultValue) {
            console.log("Default Value", defaultValue)
            setLocalData(defaultValue);
        } else {
            console.log("No default value")
        }
    }, [defaultValue])
    useEffect(() => { if (reset) { resetForm() } }, [reset])

    const resetForm = () => {
        setLocalData({});
        const randumNumber = Math.random();
        setFormKey('frm-' + randumNumber);
    }

    const handleApply = () => { onApply?.(localData) };

    // const handleClear = () => { onClear?.() };

    const handleClose = () => {
        setLocalData({});
        const randumNumber = Math.random();
        setFormKey('frm-' + randumNumber);
        setOpen?.(false)
    };

    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); handleApply(); }


    const renderInput = (cols: any, parent: string) => {
        const prefix = (parent ? parent + '.' : '');
        const onChangeHandler = (key: string, value: any) => {
            setLocalData((prev: any) => {
                if (!parent) {
                    return { ...prev, [key]: value };
                }
                let obj = { ...prev };
                try {
                    obj[parent][key] = value;
                } catch (error) {
                    obj[parent] = { [key]: value }
                }

                return (obj);
            });
        };
        return (cols?.map((column: any, idx: number) => {
            if (column) {
                if (column.type === 'group') {
                    return (<>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${idx}-content`} id={`panel${idx}-header`}>
                                <Typography component="span">{column.headerName}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {renderInput(column.fields, column.field)}
                            </AccordionDetails>
                        </Accordion>
                    </>)
                } else if (column.type === 'divider') {
                    return (<>
                        <Root>
                            <Divider textAlign="center" sx={{ mt: '13px', mb: '-6px' }}>
                                <Chip label={column.headerName} size="small" color="primary" />
                            </Divider>
                            {renderInput(column.fields, column.field)}
                        </Root>
                    </>)
                } else if (column.type === 'title') {
                    return (<div key={"section-title-" + idx}>
                        <Typography component="h4" sx={{ mt: '13px', mb: '-6px', color: '#1274b0' }}>{column.headerName}</Typography>
                        {renderInput(column.fields, column.field)}
                    </div>)
                } else {
                    switch (column.type) {
                        case 'textbox':
                            return (<TextField key={prefix + column.field} id={prefix + column.field} fullWidth variant="standard" label={column.headerName} margin="normal"
                                value={localData[prefix + column.field]}
                                onChange={(e) => onChangeHandler(column.field, e.target.value)} />);
                        case 'textarea':
                            return (<TextField key={prefix + column.field} fullWidth variant="standard" label={column.headerName} margin="normal" multiline rows={column.rows ? column.rows : 2}
                                value={localData[column.field] || null}
                                onChange={(e) => onChangeHandler(column.field, e.target.value)} />);
                        case 'dropdown':
                            return (<FormControl fullWidth variant="standard" key={prefix + column.field}>
                                <InputLabel>{column.headerName}</InputLabel>
                                <Select value={localData[column.field] || null}
                                    onChange={(e) => onChangeHandler(column.field, e.target.value)}>
                                    {column.all === undefined || column.all === true && <SelectItem value="">All</SelectItem>}
                                    {column.options && column.options.map((option: any, index: number) => (
                                        <SelectItem key={'op' + index} value={option}>
                                            {column.optionLabelField ? option[column.optionLabelField] : option}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </FormControl>);
                        case 'switch':
                            return (<FormControlLabel label={column.headerName} control={<Switch checked={localData[column.field] || false}
                                onChange={(e) => onChangeHandler(column.field, e.target.checked)}
                                className="buttonColor" />} sx={{ mt: 2, mb: 2 }} />)
                        default:
                            return null;
                    }
                }
            }

        }));
    }

    const ObjectViewer: React.FC<ObjectViewerProps> = ({ data, label, skipKeys = [] }) => {
        let rowIndex = 0;
        const toLabel = (key: string): string => {
            return key
                .replace(/_/g, " ")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/\b\w/g, char => char.toUpperCase());
        };

        return (
            <Box sx={{ mb: 2 , border:'1px solid #dedede'}}>
                {label && (
                    <Divider textAlign="left" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {toLabel(label)}
                        </Typography>
                    </Divider>
                )}

                {Object.entries(data)
                    .filter(([key]) => !skipKeys.includes(key))
                    .map(([key, value]) => {
                        const isObject =
                            typeof value === "object" && value !== null;

                        if (isObject) {
                            return (
                                <ObjectViewer
                                    key={key}
                                    data={value}
                                    label={key}
                                    skipKeys={skipKeys}
                                />
                            );
                        }

                        const isStriped = rowIndex++ % 2 === 0;

                        return (
                            <Box
                                key={key}
                                sx={{
                                    display: "flex",
                                    px: 2,
                                    py: 1,
                                    borderRadius: 1,
                                    backgroundColor: isStriped
                                        ? "action.hover"
                                        : "transparent",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ minWidth: 160 }}
                                >
                                    {toLabel(key)}
                                </Typography>

                                <Typography variant="body2">
                                    {String(value)}
                                </Typography>
                            </Box>
                        );
                    })}
            </Box>
        );
    }
    return (<div>
        <Drawer anchor="right" open={isOpen} onClose={() => handleClose()}
            sx={{
                "& .MuiDrawer-paper": {
                    width: { xs: "200vw", sm: 500 }, maxWidth: "200vw", height: "100vh", overflow: "auto", padding: { xs: 1, sm: 2 }, display: "flex",
                    flexDirection: "column", gap: 0,
                },
            }}>
            {/* Sticky Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, position: "sticky", top: 0, bgcolor: "background.paper", zIndex: 1, mt: 8, }}>
                <Typography variant="h6" sx={{ mb: 0, pb: 0 }}>{title ? title : 'Filter Options'}</Typography>
                <IconButton onClick={() => handleClose()}>
                    <CloseIcon sx={{ color: "black" }} />
                </IconButton>
            </Box>
            <Box sx={{ height: 'calc(100vh - 100px)', overflow: 'auto', gap: 1 }}>
                {/* Filter Form */}
                {columns && <form onSubmit={onSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }} key={formKey}>
                    {renderInput(columns, '')}
                    <Box sx={{ display: "flex", gap: 1, mt: 2, bgcolor: "background.paper", pt: 2, }}>
                        {buttonClearLabel && <Button type="submit" variant="contained" className="button-primary button-common" fullWidth>{buttonOkLabel ? buttonOkLabel : 'OK'}</Button>}
                        {buttonClearLabel && <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={resetForm}>Clear</Button>}
                        {!buttonClearLabel && buttonCancelLabel && <Button type="button" variant="outlined" className="button-common buttonColor" fullWidth onClick={handleClose}>{buttonCancelLabel ? buttonCancelLabel : 'Cancel'}</Button>}
                    </Box>
                </form>}
                {(!columns && defaultValue) && <ObjectViewer data={defaultValue} skipKeys={["id"]} />}
            </Box>
        </Drawer>
    </div >);
});

export default CommonDrawer;