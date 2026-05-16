/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { NotificationProvider } from "../contexts/NotificationContext";
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
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import Forbidden from "../pages/Forbidden/Forbidden";
import Services from "../pages/Home/services/Services";
import AdminDashboard from "../pages/Dashboard/Admin/AdminDashboard";
import AdminManageUsers from "../pages/Dashboard/Admin/ManageUsers/ManageUsers";
import AdminManageRiders from "../pages/Dashboard/Admin/ManageRiders";
import AdminParcelOversight from "../pages/Dashboard/Admin/ParcelOversight";
import AdminPaymentHistory from "../pages/Dashboard/Admin/AdminPaymentHistory";
import AdminPayments from "../pages/Dashboard/Admin/AllPayments";
import AdminNotifications from "../pages/Dashboard/Admin/Notifications";
import AdminSupportTickets from "../pages/Dashboard/Admin/SupportTickets";
import AdminSettings from "../pages/Dashboard/Admin/Settings";
import AdminZoneManager from "../pages/Dashboard/Admin/ZoneManager";
import AdminLiveTracking from "../pages/Dashboard/Admin/LiveTracking";
import AdminReports from "../pages/Dashboard/Admin/Reports";
import AssignRider from "../pages/Dashboard/Admin/AssignRider/AssignRider";
// Admin-only pages imported for /admin routes
import ApproveRiders from "../pages/Dashboard/Admin/ApproveRiders/ApproveRiders";
import RiderDetailPage from "../pages/Dashboard/Admin/ApproveRiders/RiderDetailPage";
import RiderDashboard from "../pages/Dashboard/RiderDashboard/RiderDashboard";
import DeliveryHistory from "../pages/Dashboard/DeliveryHistory/DeliveryHistory";
import TrackParcel from "../pages/TrackParcel/TrackParcel";
import ParcelRequests from "../pages/Dashboard/RiderDashboard/ParcelRequests";
import Notifications from "../pages/Dashboard/Notifications/Notification";
import Settings from "../pages/Dashboard/Settings/Settings";
import ProfileSettings from "../pages/Dashboard/Settings/ProfileSettings";
import NotificationSettings from "../pages/Dashboard/Settings/NotificationSettings";
import SecuritySettings from "../pages/Dashboard/Settings/SecuritySettings";
import Support from "../pages/Dashboard/Support/Support";
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

const MainLayout = () => (
  <NotificationProvider>
    <Outlet />
  </NotificationProvider>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
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
        path: 'dashboard',
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
        children: [
          {
            index: true,
            element: <DashboardIndexRedirect />
          },
          {
            path: 'my-parcels',
            Component: MyParcels
          },
          {
            path: 'track-parcel',
            Component: TrackParcel
          },
          {
            path: 'payment',
            Component: Payment
          },
          {
            path: 'payment-success',
            Component: PaymentSuccess
          },
          {
            path: 'payment-failed',
            Component: PaymentFailed
          },
          {
            path: 'payment-history',
            Component: PaymentHistory
          },
          {
            path: 'rider-dashboard',
            element: <RiderDashboard />
          },
          {
            path: 'assigned-deliveries',
            element: <PrivateRoute><AssignedDeliveries /></PrivateRoute>
          },
          {
            path: 'delivery-history',
            element: <PrivateRoute><DeliveryHistory /></PrivateRoute>
          },
          {
            path: 'rider/parcel-requests',
            element: <PrivateRoute><ParcelRequests /></PrivateRoute>
          },
          {
            path: 'notifications',
            element: <PrivateRoute><Notifications /></PrivateRoute>
          },
          {
            path: 'support',
            element: <PrivateRoute><Support /></PrivateRoute>
          },
          {
            path: 'settings',
            element: <PrivateRoute><Settings /></PrivateRoute>,
            children: [
              {
                index: true,
                element: <ProfileSettings />
              },
              {
                path: 'notifications',
                element: <NotificationSettings />
              },
              {
                path: 'security',
                element: <SecuritySettings />
              }
            ]
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
            path: 'approve-riders/:riderId',
            element: <RiderDetailPage />
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
    ]
  }
]);