import React from "react";
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

export default async function CelebrityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const celebrity = getCelebrityBySlugSync(slug);

  return <CelebrityDetailView slug={slug} initialCelebrity={celebrity} />;
}
