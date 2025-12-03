"use client";
import React, { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { usePermissions } from "@/app/utils/permissions";
import {
  USERS_VIEW,
  MODEL_VIEW,
  HELP_DESK_VIEW,
  ROLES_VIEW,
  PERMISSIONS_VIEW,
  ASSIGN_PERMISSIONS_VIEW,
  HELP_DESK_MAPPING_VIEW,
} from "@/app/utils/permissionsActions";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import type { Navigation } from "@toolpad/core/AppProvider";
import { signIn, signOut } from "next-auth/react";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import SettingsSystemDaydreamOutlined from "@mui/icons-material/SettingsSystemDaydreamOutlined";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockResetIcon from "@mui/icons-material/LockReset";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import "../global.css";

interface OptimizedLayoutProps {
  children: React.ReactNode;
  session: any;
  theme: any;
}

const getBranding = (session: any) => ({
  title: '',
  logo: (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <img src="/logo.png" alt="JMK Logo" style={{ height: 40 }} />
    </div>
  ),
});

const AUTHENTICATION = { signIn, signOut };

// Helper function to filter navigation based on permissions
const filterNavigationByPermissions = (
  navigation: any[],
  hasPermission: (action: string) => boolean
): any[] => {
  return navigation
    .map((item) => {
      // If item has children, filter them recursively
      if (item.children) {
        const filteredChildren = filterNavigationByPermissions(
          item.children,
          hasPermission
        );

        // If no children remain after filtering, exclude the parent
        if (filteredChildren.length === 0 && item.permission) {
          return null;
        }

        return {
          ...item,
          children: filteredChildren,
        };
      }

      // If item has permission requirement, check it
      if (item.permission && !hasPermission(item.permission)) {
        return null;
      }

      return item;
    })
    .filter(Boolean); // Remove null items
};

export default function OptimizedLayout({
  children,
  session,
  theme,
}: OptimizedLayoutProps) {
  const { hasPermission } = usePermissions();

  const baseNavigation = useMemo(
    () => [
      {
        segment: "",
        title: "Dashboard",
        icon: <DashboardIcon />,
        // No permission check for dashboard - always visible
      },
      ...(session?.user?.userType === "super_admin"
        ? [
            {
              segment: "master",
              title: "Master Data",
              icon: <StarBorderOutlinedIcon />,
              //permission: MASTER_DATA_VIEW,
              children: [
                {
                  segment: "company",
                  title: "Company",
                  icon: <SettingsSystemDaydreamOutlined />,
                  pattern: "company{/:companyId}*",
                },
                {
                  segment: "make",
                  title: "Make",
                  icon: <TwoWheelerOutlinedIcon />,
                  pattern: "make{/:makeId}*",
                },
                {
                  segment: "model",
                  title: "Model",
                  icon: <TwoWheelerOutlinedIcon />,
                  pattern: "model{/:modelId}*",
                  permission: MODEL_VIEW,
                },
                {
                  segment: "helpdeskmapping",
                  title: "Help Desk Mapping",
                  icon: <SupportAgentOutlinedIcon />,
                  pattern: "helpdeskmapping{/:helpdeskmappingId}*",
                  permission: HELP_DESK_MAPPING_VIEW,
                },
              ],
            },
            {
              segment: "settings",
              title: "Settings",
              icon: <AdminPanelSettingsOutlinedIcon />,
              permission: ROLES_VIEW,
              children: [
                {
                  segment: "roles",
                  title: "Roles",
                  icon: <AssignmentIndOutlinedIcon />,
                  pattern: "roles{/:rolesId}*",
                  permission: ROLES_VIEW,
                },
                {
                  segment: "permissions",
                  title: "Permissions",
                  icon: <LockOutlinedIcon />,
                  pattern: "permissions{/:permissionsId}*",
                  permission: PERMISSIONS_VIEW,
                },
                {
                  segment: "assignpermissions",
                  title: "Assign Permissions",
                  icon: <GroupOutlinedIcon />,
                  pattern: "assignpermissions{/:assignpermissionsId}*",
                  permission: ASSIGN_PERMISSIONS_VIEW,
                },
              ],
            },
          ]
        : []),
      ...(session?.user?.userType !== "user"
        ? [
            {
              segment: "users",
              title: "Users",
              icon: <PersonIcon />,
              pattern: "users{/:usersId}*",
              permission: USERS_VIEW,
            },
          ]
        : []),
      {
        title: "My Account",
        icon: <AccountCircleIcon />,
        children: [
          {
            segment: "myaccount",
            title: "Profile",
            icon: <AccountCircleIcon />,
            pattern: "myaccount{/:myaccountId}*",
          },
          {
            segment: "resetpassword",
            title: "Change Password",
            icon: <LockResetIcon />,
            pattern: "resetpassword{/:resetpasswordId}*",
          },
        ],
      },
      {
        segment: "helpdesk",
        title: "Help Desk",
        icon: <ContactSupportOutlinedIcon />,
        pattern: "helpdesk{/:helpdeskId}*",
        permission: HELP_DESK_VIEW,
      },
    ],
    [session?.user?.userType]
  );

  // Filter navigation based on permissions
  const navigation = useMemo(
    () => filterNavigationByPermissions(baseNavigation, hasPermission),
    [baseNavigation, hasPermission]
  );
  const customTheme = createTheme({
    ...theme,
    components: {
      ...theme?.components,
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "& .MuiTypography-root": {
              fontSize: "0.9rem", // Default font size
              [theme.breakpoints.down("md")]: {
                fontSize: "0.5rem", // Smaller font size on small screens
                // display: "none", // Hide text on small screens
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            "& .MuiSvgIcon-root": {
              fontSize: "1.1rem", // Default icon size
              [theme.breakpoints.down("md")]: {
                fontSize: "1rem", // Smaller icon size on small screens
              },
            },
          },
        },
      },
    },
  });
  return (
    <NextAppProvider
      navigation={navigation}
      branding={getBranding(session)}
      session={session}
      authentication={AUTHENTICATION}
      theme={customTheme}
    >
      {children}
    </NextAppProvider>
  );
}
