import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfileFollowingAlias({ params }: Props) {
  const { username } = await params;
  redirect(`/${encodeURIComponent(username)}/following`);
}
