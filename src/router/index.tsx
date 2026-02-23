import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageBooks from "@/pages/admin/ManageBooks";
import AddBook from "@/pages/admin/AddBook";
import EditBook from "@/pages/admin/EditBook";
import BorrowRequests from "@/pages/admin/BorrowRequests";
import ManageCategories from "@/pages/admin/ManageCategories";
import UserDashboard from "@/pages/user/UserDashboard";
import BrowseBooks from "@/pages/user/BrowseBooks";
import BookDetail from "@/pages/user/BookDetail";
import MyBorrows from "@/pages/user/MyBorrows";
import RootRedirect from "./RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "books", element: <ManageBooks /> },
      { path: "books/new", element: <AddBook /> },
      { path: "books/:id/edit", element: <EditBook /> },
      { path: "requests", element: <BorrowRequests /> },
      { path: "categories", element: <ManageCategories /> },
    ],
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute role="user">
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <UserDashboard /> },
      { path: "books", element: <BrowseBooks /> },
      { path: "books/:id", element: <BookDetail /> },
      { path: "my-borrows", element: <MyBorrows /> },
    ],
  },
]);
