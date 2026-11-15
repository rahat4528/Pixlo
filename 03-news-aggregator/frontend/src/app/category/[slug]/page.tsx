'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { ArticleCard } from '../../../components/ArticleCard';

export default function CategoryNewsPage() {
  const params = useParams();
  const slug = (params.slug as string) || 'technology';
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:4003/api/articles?category=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.data && data.data.length > 0) {
          setArticles(data.data);
        } else {
          // Fallback demo items
          setArticles([
            {
              id: `art-${slug}-1`,
              title: `${categoryName} Breakthroughs and Infrastructure Trends for 2026`,
              excerpt: `Analysts and industry researchers examine shifts across ${categoryName.toLowerCase()}, highlighting efficiency gains and newly ratified regulatory guidelines.`,
              canonicalUrl: `https://example.com/${slug}/trends-2026`,
              originalUrl: `https://example.com/${slug}/trends-2026`,
              publishedAt: new Date(),
              authorName: 'Senior Desk Editor',
              category: slug,
              source: {
                name: 'Global Chronicle',
                slug: 'global-chronicle',
                websiteUrl: 'https://globalchronicle.org',
              },
            },
          ]);
        }
      })
      .catch(() => {});
  }, [slug]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-xs text-news-muted">
        <Link href="/" className="hover:text-news-ink flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="capitalize font-medium text-news-ink">{slug}</span>
      </div>

      <div className="border-b border-news-border pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-news-accent mb-1">
            <Tag className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">News Desk</span>
          </div>
          <h1 className="font-headline font-black text-3xl text-news-ink">
            {categoryName} Coverage
          </h1>
        </div>
        <span className="text-xs font-semibold text-news-muted bg-white border border-news-border px-3 py-1 rounded-full">
          {articles.length} Syndicated Stories
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
