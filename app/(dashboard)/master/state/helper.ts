const defaultPayload = {
    name: '',
    code: '',
    isActive: true,
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
    if(action === 'edit'){
        delete response['id'];
    }
    return response;
};

export const getStatePayload = (activeCategories: String[]) => {
    console.log("activeCategories", activeCategories)
    return ([
        { field: "name", headerName: "State Name", type: "textbox" },
        { field: "code", headerName: "Code", type: "textbox" },
        { field: "isActive", headerName: "Status", type: "dropdown", options: [{ key: "Active", value: true }, { key: "In-Active", value: false },], optionLabelField: "key", optionValueField: "value", },
    ]);
};
export const getFilterPayload = (activeCategories: String[]) => {
    console.log("activeCategories", activeCategories)
    return ([
        { field: "search", headerName: "State Name", type: "textbox" },
        { field: "code", headerName: "Code", type: "textbox" },
        { field: "isActive", headerName: "Status", type: "dropdown", options: [{ key: "Active", value: true }, { key: "In-Active", value: false },], optionLabelField: "key", optionValueField: "value", },
    ]);
};

