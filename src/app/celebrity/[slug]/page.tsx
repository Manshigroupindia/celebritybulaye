import React, { Suspense } from "react";
import { Metadata } from "next";
import { CelebrityDetailView } from "@/components/celebrity/CelebrityDetailView";
import { getCelebrityBySlugSync } from "@/services/celebrityService";
import { celebrities } from "@/data/celebrities";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return celebrities.map((celeb) => ({
    slug: celeb.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const celeb = getCelebrityBySlugSync(slug);

  if (!celeb) {
    return { title: "Celebrity Profile — Celebrity Bulaye" };
  }

  return {
    title: `Book ${celeb.name} (${celeb.category}) — Celebrity Booking & Management | Celebrity Bulaye`,
    description: celeb.shortDescription,
  };
}

async function CelebrityDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const celebrity = getCelebrityBySlugSync(slug);
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
