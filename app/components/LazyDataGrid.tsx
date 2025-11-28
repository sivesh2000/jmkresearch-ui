"use client";
import { memo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface LazyDataGridProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  getRowId?: (row: any) => string;
  paginationModel?: any;
  pagination?: any;
  rowCount?: number | any
  paginationMode?: "client" | "server";
  pageSizeOptions?: number[];
  getRowSpacing?:any;
  rowSpacingType?:any
  onPaginationModelChange?: (model: any) => void;
  sx?: any;
  rowHeight?: number;
  getRowClassName?: (params: any) => string;
}

const LazyDataGrid = memo(function LazyDataGrid({
  rows,
  columns,
  loading,
  getRowId,
  pagination,
  rowCount,
  paginationMode,
  getRowSpacing,
  rowSpacingType,
  onPaginationModelChange,
  paginationModel,
  getRowClassName,
  pageSizeOptions = [5, 10],
  sx,
}: LazyDataGridProps) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={getRowId}
      pagination={pagination}
      paginationMode={paginationMode}
      rowCount={rowCount}
      initialState={{ pagination: { paginationModel } }}
      pageSizeOptions={pageSizeOptions}
      getRowSpacing={getRowSpacing}
      rowSpacingType={rowSpacingType}
      onPaginationModelChange={onPaginationModelChange}
      disableRowSelectionOnClick
      // disableColumnMenu
      disableColumnSelector
      disableDensitySelector
      hideFooterSelectedRowCount
      getRowClassName={getRowClassName}
      sx={{
        ...sx,
        "& .MuiDataGrid-cell": {
          display: "flex",
          alignItems: "center", // Vertically center content
          padding: "8px ",
        },
      }}
      // sx={sx}
      getRowHeight={() => "auto"}
    />
  );
});

export default LazyDataGrid;
