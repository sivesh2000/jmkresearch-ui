"use client";
import React, { memo } from "react";
import { IconButton, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { exportToExcel } from "../utils/functions";


interface ExportDataProps {
    dataArray: any[];
    type: any;
    columns: any[];
}


const ExportData = memo(function ExportData({ dataArray, type, columns }: ExportDataProps) {
    const onClickHandler = () => {
        exportToExcel(dataArray, columns, "download.xlsx");
    }

    return (<>
        <Tooltip title="Export to excel" placement="top">
            <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={onClickHandler}>
                <DownloadIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    </>);
});

export default ExportData;