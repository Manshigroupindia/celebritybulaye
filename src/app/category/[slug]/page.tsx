import React from "react";
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryListingView categorySlug={slug} />;
}
