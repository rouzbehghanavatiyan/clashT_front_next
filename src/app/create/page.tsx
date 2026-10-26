import CreateMatchClient from "@/components/create/CreateMatchClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Create",
  description: "Create a new talent clash and challenge opponents.",
  path: "/create",
});

export default function CreatePage() {
  return <CreateMatchClient />;
}
