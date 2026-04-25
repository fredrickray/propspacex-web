import type { Metadata } from "next";
import PaymentCallbackPage from "@/features/buyer/pages/PaymentCallbackPage";

export const metadata: Metadata = {
  title: "Payment",
};

export default function Page() {
  return <PaymentCallbackPage />;
}
