import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Rootlayout from "../layouts/Rootlayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Rootlayout,
    children: [
        {
            index: true,
            Component: Home
        }
    ]
  },
]);