"use client";

import BuyerSidebar from "./BuyerSidebar";

const BuyerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <BuyerSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default BuyerLayout;
