import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

async function fetchUserProfile(username: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile/${encodeURIComponent(username)}`,
      {
        next: {
          revalidate: 120,
        },
      },
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { username } = await params;

  const user = await fetchUserProfile(username);

  if (!user) {
    return {
      title: "پروفایل کاربر یافت نشد",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${user.fullName || user.userName} (@${user.userName}) | Clash Talent`;

  const description =
    user.bio ||
    `پروفایل ${user.fullName || user.userName} در Clash Talent`;

  const profileUrl = `http://localhost:8585/profile/${user.userName}`;

  const avatar =
    user.avatarUrl || "http://localhost:8585/default-avatar.png";

  return {
    title,
    description,

    alternates: {
      canonical: profileUrl,
    },

    openGraph: {
      title,
      description,
      type: "profile",
      username: user.userName,
      url: profileUrl,
      images: [
        {
          url: avatar,
          width: 500,
          height: 500,
          alt: user.userName,
        },
      ],
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

  if (!initialUserData) {
    notFound();
  }

  const profileUrl = `http://localhost:8585/profile/${initialUserData.userName}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: initialUserData.fullName || initialUserData.userName,
    alternateName: initialUserData.userName,
    description: initialUserData.bio || undefined,
    image: initialUserData.avatarUrl || undefined,
    url: profileUrl,
    sameAs: initialUserData.website
      ? [initialUserData.website]
      : [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema),
        }}
      />

      <ProfileClient initialUserData={initialUserData} />
    </>
  );
}