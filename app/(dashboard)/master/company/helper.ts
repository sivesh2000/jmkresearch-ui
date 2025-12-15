const defaultPayload = {
    name: "",
    playerType: "",
    description: "",
    website: "",
    slug: "",
    logoUrl: "",
    contactInfo: {
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: ""
    },
    socialLinks: { linkedin: "", twitter: "", facebook: "" },
    businessDetails: {
        establishedYear: new Date().getFullYear(),
        employeeCount: "",
        revenue: "",
        certifications: []
    },
    tags: [],
    isActive: true
};
export const buildPayload = (input: any) => {
    console.log("inputs", input)
    // const 
    return {
        ...defaultPayload,
        ...input,
        slug:
            input.slug ||
            input.name?.toLowerCase()?.replace(/\s+/g, "-") ||
            defaultPayload.slug,

        contactInfo: {
            ...defaultPayload.contactInfo,
            ...(input.contactInfo || {})
        },

        socialLinks: {
            ...defaultPayload.socialLinks,
            ...(input.socialLinks || {})
        },

        businessDetails: {
            ...defaultPayload.businessDetails,
            ...(input.businessDetails || {}),
            ['certifications']: input?.businessDetails?.certifications?.split(',') || []

        }
    };
};

export const getCompanyPayload = (players: String[]) => {
    return ([
        { field: "name", headerName: "Company Name", type: 'textbox' },
        { field: "playerType", multiple: true, headerName: "Player Type", type: 'dropdown', options: players || [], optionLabelField: null, optionValueField: null },
        { field: "description", headerName: "Brief Overview", type: 'textbox' },
        { field: "slug", headerName: "Slug", type: 'textbox' },
        { field: "website", headerName: "Website", type: 'textbox' },
        { field: "logoUrl", headerName: "Logo Url", type: 'textbox' },
        {
            field: 'contactInfo', headerName: "Contact Information", type: 'divider', fields: [
                { field: "email", headerName: "Email Address", type: 'textbox' },
                { field: "phone", headerName: "Contact/Phone Number", type: 'textbox' },
                { field: "address", headerName: "Address", type: 'textbox' },
                { field: "city", headerName: "City", type: 'textbox' },
                { field: "state", headerName: "State", type: 'textbox' },
                { field: "country", headerName: "Country", type: 'textbox' },
                { field: "pincode", headerName: "Pincode", type: 'textbox' },
            ]
        },
        {
            field: 'socialLinks', headerName: "Social Links", type: 'divider', fields: [
                { field: "linkedin", headerName: "LinkedIn", type: 'textbox' },
                { field: "twitter", headerName: "Twitter", type: 'textbox' },
                { field: "facebook", headerName: "Facebook", type: 'textbox' },
            ]
        },
        {
            field: 'businessDetails', headerName: "Business Details", type: 'divider', fields: [
                { field: "establishedYear", headerName: "Established Year", type: 'textbox' },
                { field: "employeeCount", headerName: "Employee Count", type: 'textbox' },
                { field: "revenue", headerName: "Revenue", type: 'textbox' },
                { field: "certifications", headerName: "Certifications", type: 'textbox' },
            ]
        }
    ]);
};
export const getFilterPayload = (players: String[]) => {
    return ([
        { field: "name", headerName: "Company Name", type: 'textbox' },
        { field: "playerType", multiple: true, headerName: "Player Type", type: 'dropdown', options: players || [], optionLabelField: null, optionValueField: null },
        { field: "slug", headerName: "Slug", type: 'textbox' },
        {
            field: 'contactInfo', headerName: "Contact Information", type: 'divider', fields: [
                { field: "email", headerName: "Email Address", type: 'textbox' },
            ]
        }
    ]);
};

