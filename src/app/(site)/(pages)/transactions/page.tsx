"use client";
import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Orders from "@/components/Orders";
import { Suspense } from "react";

const TransactionsContent = () => {
  return (
    <main className="min-h-screen bg-white pb-24">
      <Breadcrumb title="Transaksi Saya" pages={["Transaksi"]} />

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <Orders />
      </div>
    </main>
  );
};

const TransactionsPage = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
};

export default TransactionsPage;
