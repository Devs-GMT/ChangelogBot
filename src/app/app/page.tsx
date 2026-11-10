import type { Metadata } from "next";
import { Composer } from "@/features/composer/composer";

export const metadata: Metadata = {
  title: "Write a changelog",
  description: "Pick two versions, let AI group the changes, publish release notes and record them on BOT Chain.",
};

export default function AppPage() {
  return <Composer />;
}
