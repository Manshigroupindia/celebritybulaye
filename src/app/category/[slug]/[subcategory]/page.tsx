import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListingView } from "@/components/category/CategoryListingView";
import { getCategoryBySlug } from "@/services/categoryService";
import { categories } from "@/data/categories";

interface PageProps {
  params: Promise<{
    slug: string;
    subcategory: string;
  }>;
}

export async function generateStaticParams() {
  const paramsList: { slug: string; subcategory: string }[] = [];
  categories.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      paramsList.push({
        slug: cat.slug,
        subcategory: sub.slug,
      });
    });
  });
  return paramsList;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subcategory } = await params;
  const category = getCategoryBySlug(slug);
  const sub = category?.subcategories.find(
    (s) => s.slug.toLowerCase() === subcategory.toLowerCase()
  );

  if (!category || !sub) {
    return { title: "Category Not Found — Celebrity Bulaye" };
  }

  return {
    title: `Book ${sub.name}s — ${category.name} Booking | Celebrity Bulaye`,
    description: sub.description || category.description,
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { slug, subcategory } = await params;
  return <CategoryListingView categorySlug={slug} subcategorySlug={subcategory} />;
}
