/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About/About";
import Pricing from "../pages/Pricing/Pricing";
import Rootlayout from "../layouts/Rootlayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import SendParcel from "../pages/SendParcel/SendParcel";
import BeRider from "../pages/BeRider/BeRider";
import RiderStatus from "../pages/BeRider/RiderStatus";
import ParcelConfirmation from "../pages/ParcelConfirmation/ParcelConfirmation";
import PrivateRoute from "../routes/PrivateRoute";
import AdminRoute from "../routes/AdminRoute";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentSuccess from "../pages/Dashboard/Payment/PaymentSuccess";
import PaymentFailed from "../pages/Dashboard/Payment/PaymentFailed";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";
import AssignedDeliveries from "../pages/Dashboard/AssignedDeliveries/AssignedDeliveries";
import ApproveRiders from "../pages/Dashboard/ApproveRiders/ApproveRiders";
import RiderDetailPage from "../pages/Dashboard/ApproveRiders/RiderDetailPage";
import AssignRider from "../pages/Dashboard/AssignRider/AssignRider";
import ManageUsers from "../pages/Dashboard/ManageUsers/ManageUsers";
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import Forbidden from "../pages/Forbidden/Forbidden";
import Services from "../pages/Home/services/Services";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminManageUsers from "../pages/Admin/ManageUsers";
import AdminManageRiders from "../pages/Admin/ManageRiders";
import AdminParcelOversight from "../pages/Admin/ParcelOversight";
import AdminPaymentHistory from "../pages/Admin/AdminPaymentHistory";
import AdminPayments from "../pages/Admin/AllPayments";
import AdminNotifications from "../pages/Admin/Notifications";
import AdminSupportTickets from "../pages/Admin/SupportTickets";
import AdminSettings from "../pages/Admin/Settings";
import AdminZoneManager from "../pages/Admin/ZoneManager";
import AdminLiveTracking from "../pages/Admin/LiveTracking";
import AdminReports from "../pages/Admin/Reports";
import RiderDashboard from "../pages/Dashboard/RiderDashboard/RiderDashboard";
import DeliveryHistory from "../pages/Dashboard/DeliveryHistory/DeliveryHistory";
import TrackParcel from "../pages/TrackParcel/TrackParcel";
import useAuth from "../hooks/useAuth";

const DashboardIndexRedirect = () => {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return null;
  }

  return (
    <Navigate
      to={userProfile?.role === 'rider' ? '/dashboard/rider-dashboard' : '/dashboard/my-parcels'}
      replace
    />
  );
};

/**
 * 404 Not Found Page
 * Displayed when user tries to access a non-existent route
 */
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
          path: 'service',
          Component: Services
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
        },
        {
          path: 'be-rider-status',
          element: <PrivateRoute><RiderStatus /></PrivateRoute>
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
    path: '/401',
    Component: Unauthorized
  },
  {
    path: '/403',
    Component: Forbidden
  },
  {
    path:'dashboard',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children:[
      {
        index: true,
        element: <DashboardIndexRedirect />
      },
      {
        path:'my-parcels',
        Component:MyParcels
      },
      {
        path:'track-parcel',
        Component:TrackParcel
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
      },
      {
        path:'payment-history',
        Component:PaymentHistory
      },
      {
        path:'rider-dashboard',
        element: <RiderDashboard />
      },
      {
        path:'assigned-deliveries',
        element: <PrivateRoute><AssignedDeliveries /></PrivateRoute>
      },
      {
        path:'delivery-history',
        element: <PrivateRoute><DeliveryHistory /></PrivateRoute>
      },
      {
        path:'ApproveRiders',
        element: <AdminRoute><ApproveRiders /></AdminRoute>
      },
      {
        path:'ApproveRiders/:riderId',
        element: <AdminRoute><RiderDetailPage /></AdminRoute>
      },
      {
        path:'assign-rider',
        element: <AdminRoute><AssignRider /></AdminRoute>
      },
      {
        path:'ManageUsers',
        element: <AdminRoute><ManageUsers /></AdminRoute>
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: 'users',
        element: <AdminManageUsers />
      },
      {
        path: 'riders',
        element: <AdminManageRiders />
      },
      {
        path: 'parcels',
        element: <AdminParcelOversight />
      },
      {
        path: 'payments',
        element: <AdminPayments />
      },
      {
        path: 'payments-history',
        element: <AdminPaymentHistory />
      },
      {
        path: 'assign-rider',
        element: <AssignRider />
      },
      {
        path: 'approve-riders',
        element: <ApproveRiders />
      },
      {
        path: 'reports',
        element: <AdminReports />
      },
      {
        path: 'notifications',
        element: <AdminNotifications />
      },
      {
        path: 'support-tickets',
        element: <AdminSupportTickets />
      },
      {
        path: 'settings',
        element: <AdminSettings />
      },
      {
        path: 'zone-manager',
        element: <AdminZoneManager />
      },
      {
        path: 'live-tracking',
        element: <AdminLiveTracking />
      }
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);