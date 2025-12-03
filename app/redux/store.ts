import { configureStore } from "@reduxjs/toolkit";
import modelReducer from "./slices/modelSlices/modelSlice";
import allUserReducer from "./slices/userSlices/allUserSlice";
import makeReducer from "./slices/makeSlices/ActiveMakesSlice";
import filterMakesReducer from "./slices/makeSlices/filterMakesSlice";
import modelFilterReducer from "./slices/modelSlices/modelFilterSlice";
import stateReducer from "./slices/stateSlices/stateSlice";
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

export const store = configureStore({
  reducer: {
    activeMakes: makeReducer,
    filterModelData: filterMakesReducer,
    modelData: modelReducer,
    allUsers: allUserReducer,
    modelFilter: modelFilterReducer,
    stateData: stateReducer,
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
  },
});

// Types (for TSX usage)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
