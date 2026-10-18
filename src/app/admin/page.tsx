import React from "react";
import { Metadata } from "next";
import { AdminDashboardView } from "@/components/admin/dashboard/AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Dashboard — Celebrity Bulaye CMS",
  description: "Executive control center for managing celebrities, categories, and booking operations.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
