import { createBrowserRouter } from "react-router-dom";

import App from "./src/App";
import ReWearAuth from "./src/auth/ReWearAuth"
// import LandingPage from "./src/"
import DashBoard from "./src/pages/DashBoard"
import Item_listing from "./src/pages/Item_listing"
import Item_page from "./src/pages/Item_page"
import LandingPage from "./src/pages/LandingPage"
import ListItemPage from "./src/pages/ListItemPage";


const router = createBrowserRouter([
    {path: "/", element: <App/>},
    {path: "/log", element: <ReWearAuth/>},
    {path: "/dashboard", element: <DashBoard/>},
    {path: "/itempage", element: <Item_page/>},
    {path: "/landingpage", element: <LandingPage/>},
    {path: "/itemlisting", element: <Item_listing/>},
    {path: "/list-item-page", element: <ListItemPage/>},

]);

export default router;