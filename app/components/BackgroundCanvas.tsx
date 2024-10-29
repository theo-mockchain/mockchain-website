"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Suspense } from "react";

// Dynamically import the component with ssr disabled
const ClientBackgroundCanvas = dynamic(
  () => import("./ClientBackgroundCanvas"),
  { ssr: false }
);

const BackgroundCanvas = () => {
  return (
    <Suspense fallback={<div className="fixed inset-0 -z-10 bg-[#16172B]" />}>
      <ClientBackgroundCanvas />
    </Suspense>
  );
};

export default BackgroundCanvas;
