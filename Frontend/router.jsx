import { createBrowserRouter } from "react-router-dom";

import App from "./src/App";
import ReWearAuth from "./src/auth/ReWearAuth"
// import LandingPage from "./src/"


const router = createBrowserRouter([
    {path: "/", element: <App/>},
    {path: "/log", element: <ReWearAuth/>},
]);

export default router;