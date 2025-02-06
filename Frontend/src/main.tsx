import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainPage from "./pages/MainPage/MainPage.tsx";
import FacultiesPage from "./pages/FacultiesPage/FacultyPage.tsx";
import { Provider } from "react-redux";
import store from "./store.tsx";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.tsx";
import UsersPage from "./pages/UsersPage/UsersPage.tsx";
import PlacesPage from "./pages/PlacesPage/PlacesPage.tsx";
import EventsPage from "./pages/EventsPage/EventsPage.tsx";
import AddEventPage from "./pages/AddEventPage/AddEventPage.tsx";
import UpdateEventPage from "./pages/UpdateEventPage/UpdateEventPage.tsx";
import InviteListPage from "./pages/InviteListPage/InviteListPage.tsx";
import ReportsPage from "./pages/ReportsPage/ReportsPage.tsx";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.tsx";

const router = createBrowserRouter(
  [
    {
      element: <App />,
      path: "/",
      children: [
        {
          path: "/",
          element: <MainPage />,
        },
        {
          path: "/users",
          element: (
            <PrivateRoute allowedRoles={["admin", "db admin"]}>
              <UsersPage />
            </PrivateRoute>
          ),
        },
        {
          path: "/places",
          element: (
            <PrivateRoute
              allowedRoles={["admin", "db admin", "event manager", "showman"]}
            >
              <PlacesPage />,
            </PrivateRoute>
          ),
        },
        {
          path: "/events",
          element: <EventsPage />,
        },
        {
          path: "/event_request",
          element: (
            <PrivateRoute allowedRoles={["admin", "db admin", "client"]}>
              <AddEventPage />,
            </PrivateRoute>
          ),
        },
        {
          path: "/event_manage/:id",
          element: <UpdateEventPage />,
        },
        {
          path: "/event_invite_list/:id",
          element: (
            <PrivateRoute
              allowedRoles={[
                "admin",
                "db admin",
                "client",
                "showman",
                "event manager",
              ]}
            >
              <InviteListPage />,
            </PrivateRoute>
          ),
        },
        {
          path: "/event_reports/:id",
          element: (
            <PrivateRoute allowedRoles={["admin", "db admin", "event manager"]}>
              <ReportsPage />,
            </PrivateRoute>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
      v7_fetcherPersist: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
