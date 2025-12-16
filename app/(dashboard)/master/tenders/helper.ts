import { GridColDef, GridDownloadIcon } from "@mui/x-data-grid";
export type ColumnConfig = {
    field: string;
    headerName: string;
    flex: number;
    type: string;
    options?: any[];
    optionLabelField?: string;
    optionValueField?: string;
    all?: boolean;
};
interface CompanyItem {
    id: number;
    name: string;
    isActive: boolean;
}

interface StateItem {
    id: number;
    name: string;
    isActive: boolean;
}
const defaultPayload = {
    tenderName: "",
    tenderNumber: "",
    slug: "",
    rfsIssueDate: "",
    bidSubmissionDeadline: "",
    technology: "",
    tenderingAuthority: "",
    tenderScope: "",
    tenderCapacityMW: 0,
    allottedCapacityMW: 0,
    ceilingTariffINR: 0,
    commissioningTimelineMonths: 0,
    expectedCommissioningDate: 0,
    tenderStatus: 'Open',
    lowestTariffQuoted: 0,
    storageComponent: "",
    notes: "",
    winnersDetails: "",
    ppaSigningDate: "",
    location: "",
    resultAnnouncedDate: "",

    // Relationships
    companyId: 0,
    stateId: 0,

    // Documents
    tenderDocuments: [],

    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};
export const buildPayload = (input: any) => {
    console.log("Input", input);
    delete input['slug'];
    delete input['createdAt'];
    delete input['updatedAt'];
    return {
        ...defaultPayload,
        ...input,
    };
};

export const getTenderPayload = (companies: CompanyItem[], states: StateItem[]) => {
    console.log("Companies", companies)
    console.log("states", states)
    return ([
        { field: 'tenderName', headerName: 'Tender Name', flex: 1, type: 'textbox' },
        { field: 'tenderNumber', headerName: 'Tender Number', flex: 1, type: 'textbox' },
        // { field: 'slug', headerName: 'Slug', flex: 1, type: 'textbox' },
        { field: 'rfsIssueDate', headerName: 'RFS Issue Date', flex: 1, type: 'textbox' },
        { field: 'bidSubmissionDeadline', headerName: 'BID Submission Deadline', flex: 1, type: 'textbox' },
        { field: 'technology', headerName: 'Technology', flex: 1, type: 'textbox' },
        { field: 'tenderingAuthority', headerName: 'Tender Ingauthority', flex: 1, type: 'textbox' },
        { field: 'tenderScope', headerName: 'Tender Scope', flex: 1, type: 'textbox' },
        { field: 'tenderCapacityMW', headerName: 'Tender Capacity MW', flex: 1, type: 'textbox' },
        { field: 'allottedCapacityMW', headerName: 'Allotted Capacity MW', flex: 1, type: 'textbox' },
        { field: 'ceilingTariffINR', headerName: 'Ceiling Tariff INR', flex: 1, type: 'textbox' },
        { field: 'commissioningTimelineMonths', headerName: 'Commissioning Timeline Months', flex: 1, type: 'textbox' },
        { field: 'expectedCommissioningDate', headerName: 'Expected Commissioning Date', flex: 1, type: 'textbox' },
        { field: 'tenderStatus', headerName: 'Tender Status', flex: 1, type: 'textbox' },
        { field: 'lowestTariffQuoted', headerName: 'Lowest Tariff Quoted', flex: 1, type: 'textbox' },
        { field: 'storageComponent', headerName: 'Storage Component', flex: 1, type: 'textbox' },
        { field: 'notes', headerName: 'Notes', flex: 1, type: 'textbox' },
        { field: 'winnersDetails', headerName: 'Winners Details', flex: 1, type: 'textbox' },
        { field: 'ppaSigningDate', headerName: 'PPA Signing Date', flex: 1, type: 'textbox' },
        { field: 'location', headerName: 'Location', flex: 1, type: 'textbox' },
        { field: 'resultAnnouncedDate', headerName: 'Result Announced Date', flex: 1, type: 'textbox' },
        { field: 'company', headerName: 'Company', flex: 1, type: 'dropdown', options: companies || [], optionLabelField: 'name', optionValueField: null, all: false },
        { field: 'state', headerName: 'State', flex: 1, type: 'dropdown', options: states || [], optionLabelField: 'name', optionValueField: null, all: false },

    ]);
};

const filterColumns: any[] = [
    { field: "tenderName", headerName: "Tender Name", flex: 1 },
    { field: "tenderNumber", headerName: "Tender Number", flex: 1 },
    { field: "slug", headerName: "Slug", flex: 1 },
    { field: "rfsIssueDate", headerName: "RFS Issue Date", flex: 1 },
    { field: "bidSubmissionDeadline", headerName: "Bid Submission Deadline", flex: 1 },
    { field: "technology", headerName: "Technology", flex: 1 },
    { field: "tenderingAuthority", headerName: "Tendering Authority", flex: 1 },
    { field: "tenderScope", headerName: "Tender Scope", flex: 1 },
    { field: "tenderCapacityMW", headerName: "Tender Capacity (MW)", flex: 1 },
    { field: "allottedCapacityMW", headerName: "Allotted Capacity (MW)", flex: 1 },
    { field: "ceilingTariffINR", headerName: "Ceiling Tariff (INR)", flex: 1 },
    { field: "commissioningTimelineMonths", headerName: "Commissioning Timeline (Months)", flex: 1 },
    { field: "expectedCommissioningDate", headerName: "Expected Commissioning Date", flex: 1 },
    { field: "tenderStatus", headerName: "Tender Status", flex: 1 },
    { field: "lowestTariffQuoted", headerName: "Lowest Tariff Quoted", flex: 1 },
    { field: "storageComponent", headerName: "Storage Component", flex: 1 },
    { field: "notes", headerName: "Notes", flex: 1 },
    { field: "winnersDetails", headerName: "Winners Details", flex: 1 },
    { field: "ppaSigningDate", headerName: "PPA Signing Date", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "resultAnnouncedDate", headerName: "Result Announced Date", flex: 1 },

    // Relationships
    { field: "companyId", headerName: "Company", flex: 1 },
    { field: "stateId", headerName: "State", flex: 1 },

    // Documents
    { field: "tenderDocuments", headerName: "Tender Documents", flex: 1 },

    { field: "isActive", headerName: "Active", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "updatedAt", headerName: "Updated At", flex: 1 },


];
export const getFilterPayload = (companies: any[], states: any[]) => {
    return ([
        { field: 'tenderName', headerName: 'Tender Name', flex: 1, type: 'textbox' },
        { field: 'tenderNumber', headerName: 'Tender Number', flex: 1, type: 'textbox' },
        { field: "slug", headerName: "Slug", type: 'textbox' },
        { field: 'rfsIssueDate', headerName: 'RFS Issue Date', flex: 1, type: 'textbox' },
        { field: 'bidSubmissionDeadline', headerName: 'BID Submission Deadline', flex: 1, type: 'textbox' },
        { field: 'technology', headerName: 'Technology', flex: 1, type: 'textbox' },
        { field: 'tenderingAuthority', headerName: 'Tender Ingauthority', flex: 1, type: 'textbox' },
        { field: 'tenderScope', headerName: 'Tender Scope', flex: 1, type: 'textbox' },
    ]);
};

