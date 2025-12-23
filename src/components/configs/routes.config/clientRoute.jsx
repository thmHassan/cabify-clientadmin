import { lazy } from "react";
import * as KEY from "../../../constants/routes.key.constant/client.route.key.constant";
import * as PATH from "../../../constants/routes.path.constant/client.route.path.constant";
import { path } from "framer-motion/client";
import { components } from "react-select";

const clientRoute = [
  {
    key: KEY.OVERVIEW_KEY,
    path: PATH.OVERVIEW_PATH,
    component: lazy(() => import("../../../views/client/pages/Overview")),
    authority: [],
  },
  {
    key: KEY.ACCOUNTS_KEY,
    path: PATH.ACCOUNTS_PATH,
    component: lazy(() => import("../../../views/client/pages/Accounts")),
    authority: [],
  },
  {
    key: KEY.CANCELLATIONS_KEY,
    path: PATH.CANCELLATIONS_PATH,
    component: lazy(() => import("../../../views/client/pages/Cancellations")),
    authority: [],
  },
  {
    key: KEY.DISPATCHER_KEY,
    path: PATH.DISPATCHER_PATH,
    component: lazy(() => import("../../../views/client/pages/Dispatcher")),
    authority: [],
  },
  {
    key: KEY.DRIVER_DOCUMENTS_KEY,
    path: PATH.DRIVER_DOCUMENTS_PATH,
    component: lazy(() => import("../../../views/client/pages/DriverDocuments")),
    authority: [],
  },
  {
    key: KEY.DRIVERS_MANAGEMENT_KEY,
    path: PATH.DRIVERS_MANAGEMENT_PATH,
    component: lazy(() => import("../../../views/client/pages/DriversManagement")),
    authority: [],
  },
  {
    key: KEY.DRIVERS_DETAILS_KEY,
    path: PATH.DRIVER_DETAILS_PATH,
    component: lazy(() => import("../../../views/client/pages/DriversManagement/components/DriverDetails")),
    authority: [],
  },
  {
    key: KEY.GENERAL_NOTIFICATION_KEY,
    path: PATH.GENERAL_NOTIFICATION_PATH,
    component: lazy(() => import("../../../views/client/pages/GeneralNotification")),
    authority: [],
  },
  {
    key: KEY.LOST_FOUND_KEY,
    path: PATH.LOST_FOUND_PATH,
    component: lazy(() => import("../../../views/client/pages/LostFound")),
    authority: [],
  },
  {
    key: KEY.LOST_FOUND_DETAILS_KEY,
    path: PATH.LOST_FOUND_DETAILS_PATH,
    component: lazy(() => import("../../../views/client/pages/LostFound/components/LostFoundDetails")),
    authority: [],
  },
  {
    key: KEY.MANAGE_ZONES_KEY,
    path: PATH.MANAGE_ZONES_PATH,
    component: lazy(() => import("../../../views/client/pages/ManageZones")),
    authority: [],
  },
  {
    key: KEY.MAP_KEY,
    path: PATH.MAP_PATH,
    component: lazy(() => import("../../../views/client/pages/Map")),
    authority: [],
  },
  {
    key: KEY.PLOTS_KEY,
    path: PATH.PLOTS_PATH,
    component: lazy(() => import("../../../views/client/pages/Plots")),
    authority: [],
  },
  {
    key: KEY.REVENUE_STATEMENTS_KEY,
    path: PATH.REVENUE_STATEMENTS_PATH,
    component: lazy(() => import("../../../views/client/pages/RevenueStatements")),
    authority: [],
  },
  {
    key: KEY.REVIEWS_KEY,
    path: PATH.REVIEWS_PATH,
    component: lazy(() => import("../../../views/client/pages/Reviews")),
    authority: [],
  },
  {
    key: KEY.RIDES_MANAGEMENT_KEY,
    path: PATH.RIDES_MANAGEMENT_PATH,
    component: lazy(() => import("../../../views/client/pages/RidesManagement")),
    authority: [],
  },
  {
    key: KEY.SETTINGS_CONFIGURATION_KEY,
    path: PATH.SETTINGS_CONFIGURATION_PATH,
    component: lazy(() => import("../../../views/client/pages/SettingsConfiguration")),
    authority: [],
  },
  {
    key: KEY.SOS_KEY,
    path: PATH.SOS_PATH,
    component: lazy(() => import("../../../views/client/pages/SOS")),
    authority: [],
  },
  {
    key: KEY.SUB_COMPANY_KEY,
    path: PATH.SUB_COMPANY_PATH,
    component: lazy(() => import("../../../views/client/pages/SubCompany")),
    authority: [],
  },
  {
    key: KEY.TICKETS_KEY,
    path: PATH.TICKETS_PATH,
    component: lazy(() => import("../../../views/client/pages/Tickets")),
    authority: [],
  },
  {
    key: KEY.USERS_KEY,
    path: PATH.USERS_PATH,
    component: lazy(() => import("../../../views/client/pages/Users")),
    authority: [],
  },
  {
    key: KEY.USER_DETAILS_KEY,
    path: PATH.USER_DETAILS_PATH,
    component: lazy(() => import("../../../views/client/pages/Users/components/EditUserDetails")),
    authority: [],
  },
  {
    key: KEY.VEHICLE_TYPE_KEY,
    path: PATH.VEHICLE_TYPE_PATH,
    component: lazy(() => import("../../../views/client/pages/VehicleType")),
    authority: [],
  },
  {
    key: KEY.VEHICLE_TYPE_DETAILS_KEY,
    path: PATH.VEHICLE_TYPE_DETAILS_PATH,
    component: lazy(() => import("../../../views/client/pages/VehicleType/components/AddVehicleType")),
    authority: [],
  },
  {
    key: KEY.APP_DISPLAY_CONTENT_KEY,
    path: PATH.APP_DISPLAY_CONTENT_PATH,
    component: lazy(() => import("../../../views/client/pages/AppDisplayContent")),
    authority: [],
  }
  // {
  //   key: KEY.VEHICLES_MANAGEMENT_PATH,
  //   path: PATH.VEHICLES_MANAGEMENT_PATH,
  //   component: lazy(() => import("../../../views/client/pages/VehiclesTypeManagement")),
  //   authority: [],
  // }
];

export default clientRoute;