export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "Dashboards",
    children: [
      {
        name: "Dashboard",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/dashboard",
      },
    ],
  },
  {
    heading: "Utilities",
    children: [
      {
        name: "Send Messages (Email)",
        icon: "solar:text-circle-outline",
        id: uniqueId(),
        url: "/ui/sendmessage",
      },
      {
        name: "Send Messages (SMS)",
        icon: "solar:text-circle-outline",
        id: uniqueId(),
        url: "/ui/sendsms",
      }
      // {
      //   name: "menu1",
      //   icon: "solar:bedside-table-3-linear",
      //   id: uniqueId(),
      //   url: "/ui/table",
      // },
      // {
      //   name: "menu2",
      //   icon: "solar:password-minimalistic-outline",
      //   id: uniqueId(),
      //   url: "/ui/form",
      // },
      // {
      //   name: "menu3",
      //   icon: "solar:airbuds-case-charge-outline",
      //   id: uniqueId(),
      //   url: "/ui/shadow",
      // },
    ],
  },
  {
    heading: "Auth",
    children: [
      {
        name: "Login",
        icon: "solar:login-2-linear",
        id: uniqueId(),
        url: "/auth/login",
      },
      {
        name: "Register",
        icon: "solar:shield-user-outline",
        id: uniqueId(),
        url: "/auth/register",
      },
    ],
  },
  // {
  //   heading: "Extra",
  //   children: [
  //     {
  //       name: "Icons",
  //       icon: "solar:smile-circle-outline",
  //       id: uniqueId(),
  //       url: "/icons/solar",
  //     },
  //     {
  //       name: "Sample Page",
  //       icon: "solar:notes-minimalistic-outline",
  //       id: uniqueId(),
  //       url: "/sample-page",
  //     },
  //   ],
  // },
];

export default SidebarContent;
