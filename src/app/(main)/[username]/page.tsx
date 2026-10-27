import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";
import StringHelpers from "@/utils/StringHelpers";
import { SITE_URL } from "@/lib/socket";
import { userService } from "@/services/user.service";
import { RESERVED_PATHS } from "@/lib/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export interface UserProfileData {
  id: number;
  userName: string;
  fullName?: string;
  bio?: string;
  location?: string;
  profile?: any;
  avatarUrl?: string;
  score: number;
  followersCount: number;
  followingCount: number;
}

const IGNORED_PATHS = ["favicon.ico", "robots.txt", "sitemap.xml", ...RESERVED_PATHS];

async function fetchUserProfile(rawUsername: string): Promise<UserProfileData | null> {
  const username = decodeURIComponent(rawUsername);

  if (
    !username ||
    IGNORED_PATHS.includes(username.toLowerCase()) ||
    username.includes(".")
  ) {
    return null;
  }

  try {
    const res = await userService.profile(username);

    if (res?.data?.status !== 0) {
      console.error("[profile] body:", res);
      return null;
    }

    const d = res?.data?.data;
    if (!d || (!d.userId && !d.id && !d.userName)) return null;

    const attachment = d.avatar ?? d.profile ?? null;

    let avatarUrl: string | undefined;
    try {
      avatarUrl = attachment
        ? (StringHelpers.getProfile(attachment) ?? undefined)
        : undefined;
    } catch {
      avatarUrl = undefined;
    }

    return {
      id: d.userId ?? d.id,
      userName: d.userName,
      fullName: d.fullName || d.userName,
      bio: d.bio ?? "",
      location: d.location ?? "",
      profile: attachment,
      avatarUrl,
      score: d.score ?? 0,
      followersCount: d.followersCount ?? 0,
      followingCount: d.followingCount ?? 0,
    };
  } catch (err) {
    console.error("[profile] fetch failed:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  if (IGNORED_PATHS.includes(username.toLowerCase()) || username.includes(".")) {
    return {};
  }

  const user = await fetchUserProfile(username);

  if (!user) {
    return {
      title: "User Profile Not Found | Clash Talent",
      robots: { index: false, follow: false },
    };
  }

  const name = user.fullName || user.userName;
  const title = `${name} (@${user.userName}) | Clash Talent`;
  const description = user.bio || `Watch ${name}'s talents and matches on Clash Talent`;
  const profileUrl = `${SITE_URL}/${encodeURIComponent(user.userName)}`;
  const avatar = user.avatarUrl || `${SITE_URL}/default-avatar.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      title,
      description,
      type: "profile",
      username: user.userName,
      url: profileUrl,
      images: [{ url: avatar, width: 500, height: 500, alt: user.userName }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [avatar],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;

  if (IGNORED_PATHS.includes(username.toLowerCase()) || username.includes(".")) {
    notFound();
  }

  const initialUserData = await fetchUserProfile(username);

  if (!initialUserData) {
    notFound();
  }

  const profileUrl = `${SITE_URL}/${encodeURIComponent(initialUserData.userName)}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: initialUserData.fullName || initialUserData.userName,
    alternateName: initialUserData.userName,
    description: initialUserData.bio || undefined,
    image: initialUserData.avatarUrl || undefined,
    url: profileUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <ProfileClient initialUserData={initialUserData} />
    </>
  );
}