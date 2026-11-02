import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListingView } from "@/components/category/CategoryListingView";
import { getCategoryBySlug } from "@/services/categoryService";
import { categories } from "@/data/categories";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found — Celebrity Bulaye" };
  }

  return {
    title: `Book ${category.name}s — Verified ${category.name} Booking Platform | Celebrity Bulaye`,
    description: category.description,
  };
}

async function CategoryPageContent({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryListingView categorySlug={slug} />;
}

function CategoryLoadingFallback() {
  return (
    <div className="bg-[#FAF9F6] min-h-[60vh] flex items-center justify-center">
      <div className="text-xs text-gray-400 animate-pulse">Loading category catalog...</div>
    </div>
  );
}

export default function CategoryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CategoryLoadingFallback />}>
      <CategoryPageContent params={params} />
    </Suspense>
  );
}
