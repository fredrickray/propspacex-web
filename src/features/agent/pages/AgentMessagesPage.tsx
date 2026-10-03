"use client";

import { OpenMessagingRoute } from "@/features/communications/messaging-dock";

export default function AgentMessagesPage() {
  return <OpenMessagingRoute fallbackHref="/agent" />;
}
