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
            ...(input.businessDetails || {})
        }
    };
};