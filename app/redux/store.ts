import { configureStore } from "@reduxjs/toolkit";
import allUserReducer from "./slices/userSlices/allUserSlice";
import cityReducer from "./slices/citySlices/citySlice";
import districtReducer from "./slices/districtSlice";
import userDataReducer from "./slices/userSlices/UserDataSlice";
import rolesReducer from "./slices/rolesPermissionsSlices/rolesSlice";
import permissionsReducer from "./slices/rolesPermissionsSlices/permissionsSlice";
import assignedPermissionsReducer from "./slices/rolesPermissionsSlices/assignedPermissionsSlice";
import helpdeskReducer from "./slices/helpdeskSlices/helpdeskSlice";
import helpDeskMappingReducer from "./slices/helpDeskMappingSlices/helpDeskMappingSlice";
import allAssignRolesReducer from "./slices/userSlices/allAssignRolesSlice";
import companyReducer from "./slices/companySlices/ActiveCompaniesSlice";
import categoryReducer from "./slices/categorySlices/ActiveCategoriesSlice";
import subCategoryReducer from "./slices/subCategorySlices/ActiveSubCategoriesSlice";
import stateReducer from "./slices/stateSlices/ActiveStatesSlice";
import tenderReducer from "./slices/tenderSlice/ActiveTenderSlice";

export const store = configureStore({
  reducer: {
    allUsers: allUserReducer,
    // stateData: stateReducer,
    cityData: cityReducer,
    districtData: districtReducer,
    loggedUserData: userDataReducer,
    rolesData: rolesReducer,
    permissionsData: permissionsReducer,
    assignedPermissionsData: assignedPermissionsReducer,
    helpdeskData: helpdeskReducer,
    helpDeskMapping: helpDeskMappingReducer,
    allAssignRolesUserData: allAssignRolesReducer,
    activeCompanies: companyReducer,
    activeCategories: categoryReducer,
    activeSubCategories: subCategoryReducer,
    activeStates: stateReducer,
    activeTenders: tenderReducer,
  },
});

// Types (for TSX usage)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
