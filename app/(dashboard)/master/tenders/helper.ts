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
    return {
        ...defaultPayload,
        ...input,
        slug:
            input.slug ||
            input.name?.toLowerCase()?.replace(/\s+/g, "-") ||
            defaultPayload.slug,
    };
};