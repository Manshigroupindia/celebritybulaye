import React, { Suspense } from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { CelebrityDetailView } from "@/components/celebrity/CelebrityDetailView";
import {
  getCelebrityBySlugSync,
  getCelebrityBySlugFromFirestore,
} from "@/services/celebrityService";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  let celeb = getCelebrityBySlugSync(slug);
  if (!celeb) {
    celeb = await getCelebrityBySlugFromFirestore(slug);
  }

  if (!celeb) {
    return { title: "Celebrity Profile — Celebrity Bulaye" };
  }

  return {
    title: `Book ${celeb.name} (${celeb.category}) — Celebrity Booking & Management | Celebrity Bulaye`,
    description: celeb.shortDescription || celeb.description,
  };
}

async function CelebrityDetailContent({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  let celebrity = getCelebrityBySlugSync(slug);
  if (!celebrity) {
    celebrity = await getCelebrityBySlugFromFirestore(slug);
  }
  return <CelebrityDetailView slug={slug} initialCelebrity={celebrity} />;
}

function CelebrityDetailFallback() {
  return (
    <div className="bg-[#0B0F19] min-h-[60vh] flex items-center justify-center">
      <div className="text-xs text-gray-400 animate-pulse">Loading celebrity profile...</div>
    </div>
  );
}

export default function CelebrityDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CelebrityDetailFallback />}>
      <CelebrityDetailContent params={params} />
    </Suspense>
  );
}
