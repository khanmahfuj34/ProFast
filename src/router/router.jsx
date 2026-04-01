import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Rootlayout from "../layouts/Rootlayout";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";

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
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: 'login',
        Component: Login
      }
    ]
  }
]);