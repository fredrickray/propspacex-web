import type { Metadata } from "next";
import { MessagesPage } from "@/features/buyer";

export const metadata: Metadata = {
  title: "Messages",
};

export default function Page() {
  return <MessagesPage />;
}
