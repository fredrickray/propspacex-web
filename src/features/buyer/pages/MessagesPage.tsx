"use client";

import { OpenMessagingRoute } from "@/features/communications/messaging-dock";

const MessagesPage = () => {
  return <OpenMessagingRoute fallbackHref="/buyer" />;
};

export default MessagesPage;
