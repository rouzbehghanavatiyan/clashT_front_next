import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";
import StringHelpers from "@/utils/StringHelpers";
import { API_URL, SITE_URL } from "@/lib/socket";

interface Props {
  params: Promise<{ username: string }>;
}

export interface UserProfileData {
  id: number;
  userName: string;
  fullName?: string;
  bio?: string;
  location?: string;
  profile?: any; // آبجکت Attachment، همان چیزی که StringHelpers.getProfile می‌خواهد
  avatarUrl?: string;
  score: number;
  followersCount: number;
  followingCount: number;
}

async function fetchUserProfile(
  rawUsername: string,
): Promise<UserProfileData | null> {
  const username = decodeURIComponent(rawUsername);

  try {
    const res = await fetch(
      `${API_URL}/api/User/profile/${encodeURIComponent(username)}`,
      { next: { revalidate: 30 } },
    );

    if (!res.ok) return null;

    const json = await res.json();
    const d = json?.data;
    if (!d) return null;

    // بسته به اینکه property را Avatar یا Profile گذاشته‌اید، هر دو پوشش داده شده
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
      id: d.userId,
      userName: d.userName,
      fullName: d.userName,
      bio: d.bio ?? "",
      location: d.location ?? "",
      profile: attachment,
      avatarUrl,
      score: d.score ?? 0,
      followersCount: d.followersCount ?? 0,
      followingCount: d.followingCount ?? 0,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await fetchUserProfile(username);

  if (!user) {
    return {
      title: "پروفایل کاربر یافت نشد",
      robots: { index: false, follow: false },
    };
  }

  const name = user.fullName || user.userName;
  const title = `${name} (@${user.userName}) | Clash Talent`;
  const description = user.bio || `پروفایل ${name} در Clash Talent`;
  const profileUrl = `http://localhost:7131/api/User/profile/${encodeURIComponent(user.userName)}`;
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
  const initialUserData = await fetchUserProfile(username);

  if (!initialUserData) notFound();

  const profileUrl = `${SITE_URL}/profile/${encodeURIComponent(initialUserData.userName)}`;

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
          // جلوگیری از شکستن تگ script با کاراکتر <
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <ProfileClient initialUserData={initialUserData} />
    </>
  );
}