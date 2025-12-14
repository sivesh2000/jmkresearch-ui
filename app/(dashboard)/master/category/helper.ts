const defaultPayload = {
    name: '',
    slug: '',
    description: '',
    isActive: true,
    color: '',
    order: 0,
    icon: '',
    parentId: null
};
export const buildPayload = (input: any, action:String="edit") => {
    console.log("inputs", input)
    let response ={
        ...defaultPayload,
        ...input,
        isActive: input.value || true
    };
    if(action === 'new'){
        delete response['id'];
    }
    return response;
};

export const getCategoryPayload = (players: String[]) => {
    return ([
        { field: "name", headerName: "Category Name", type: "textbox" },
        { field: "slug", headerName: "Slug", type: "textbox" },
        { field: "color", headerName: "Color", type: "textbox" },
        { field: "isActive", headerName: "Status", type: "dropdown", options: [{ key: "Active", value: true }, { key: "In-Active", value: false },], optionLabelField: "key", optionValueField: "value", },
        { field: "description", headerName: "Description", type: "textarea", rows: 2 },
    ]);
};
export const getFilterPayload = (players: String[]) => {
    return ([
        { field: "name", headerName: "Category Name", type: "textbox" },
        { field: "slug", headerName: "Slug", type: "textbox" },
        { field: "color", headerName: "Color", type: "textbox" },
        { field: "isActive", headerName: "Status", type: "dropdown", options: [{ key: "Active", value: true }, { key: "In-Active", value: false },], optionLabelField: "key", optionValueField: "value", },
    ]);
};

