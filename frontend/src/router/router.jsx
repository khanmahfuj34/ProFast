/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About/About";
import Pricing from "../pages/Pricing/Pricing";
import Rootlayout from "../layouts/Rootlayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import SendParcel from "../pages/SendParcel/SendParcel";
import BeRider from "../pages/BeRider/BeRider";
import ParcelConfirmation from "../pages/ParcelConfirmation/ParcelConfirmation";
import PrivateRoute from "../routes/PrivateRoute";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentSuccess from "../pages/Dashboard/Payment/PaymentSuccess";
import PaymentFailed from "../pages/Dashboard/Payment/PaymentFailed";

// Not Found component
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
    <p className="text-xl text-gray-600 mb-8">Page not found</p>
    <a href="/" className="btn btn-primary">
      Go to Home
    </a>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Rootlayout,
    children: [
        {
            index: true,
            Component: Home
        },
        {
          path: 'about',
          Component: About
        },
        {
          path: 'pricing',
          Component: Pricing
        },
        {
          path: 'coverage',
          Component: Coverage
        },
        {
          path: 'send-parcel',
          element: <PrivateRoute><SendParcel /></PrivateRoute>
        },
        {
          path: 'parcel-confirmation',
          element: <PrivateRoute><ParcelConfirmation /></PrivateRoute>
        },
        {
          path: 'be-rider',
          element: <PrivateRoute><BeRider /></PrivateRoute>
        }
    ]
  },
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      {
        path: 'login',
        Component: Login
      },
      {
        path: 'register',
        Component: Register
      }
    ]
  },
  {
    path:'dashboard',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children:[
      {
        index: true,
        Component: MyParcels
      },
      {
        path:'my-parcels',
        Component:MyParcels
      },
      {
        path:'payment',
        Component:Payment
      },
      {
        path:'payment-success',
        Component:PaymentSuccess
      },
      {
        path:'payment-failed',
        Component:PaymentFailed
      }
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);