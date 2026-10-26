import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfileFollowersAlias({ params }: Props) {
  const { username } = await params;
  redirect(`/${encodeURIComponent(username)}/followers`);
}
