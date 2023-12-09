"use client";

import { HuddleClient, HuddleProvider } from "@huddle01/react";

type Props = {
  children: React.ReactNode;
};

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID!,
  options: {
    activeSpeakers: {
      size: 8,
    },
  },
});

const HuddleWrapper = ({ children }: Props) => {
  return (
    <HuddleProvider key="huddle01-provider" client={huddleClient}>
      {children}
    </HuddleProvider>
  );
};

export default HuddleWrapper;
