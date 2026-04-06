import { ReactNode } from "react";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] via-[#0d1410] to-[#0a100e] flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <AppHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
