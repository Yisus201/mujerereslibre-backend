import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import type { Category, Article } from '../types';

interface NewsPopupProps {
  onOpenArticle?: (article: Article, category: Category) => void;
}

const SHOW_DELAY_MS = 0;
export default function NewsPopup({ onOpenArticle }: NewsPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [featuredCategory, setFeaturedCategory] = useState<Category | null>(null);

  useEffect(() => {

    fetch('https://mujerereslibre-backend.onrender.com/api/news')
      .then(r => r.json())
      .then((categories: Category[]) => {
        if (!categories?.length) return;

        let pinned: Article | null = null;
        let pinnedCategory: Category | null = null;
        let latest: Article | null = null;
        let latestCategory: Category | null = null;

        categories.forEach(cat => {
          cat.articles?.forEach(article => {
            if (article.is_hidden) return;
            if (article.is_popup && !pinned) {
              pinned = article;
              pinnedCategory = cat;
            }
            if (!latest || article.id > latest.id) {
              latest = article;
              latestCategory = cat;
            }
          });
        });

        const chosen = pinned ?? latest;
        const chosenCat = pinnedCategory ?? latestCategory;
        if (!chosen) return;

        setFeaturedArticle(chosen);
        setFeaturedCategory(chosenCat);

        const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
        return () => clearTimeout(timer);
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => setIsVisible(false), 380);
  };

  const handleReadMore = () => {
    if (!featuredArticle) return;
    dismiss();

    setTimeout(() => {
      // Dispatch the custom event — News.tsx listens and opens the article directly
      window.dispatchEvent(
        new CustomEvent('open-article', { detail: featuredArticle.id })
      );
      // Also call prop callback if provided
      if (featuredCategory && onOpenArticle) {
        onOpenArticle(featuredArticle, featuredCategory);
      }
    }, 400);
  };

  if (!isVisible || !featuredArticle) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-8 transition-opacity duration-350 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden transition-all duration-380 ${
          isAnimatingOut ? 'opacity-0 translate-y-6 scale-[0.97]' : 'opacity-100 translate-y-0 scale-100'
        }`}
        style={{
          borderRadius: '28px',
          transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
          /* Liquid glass effect */
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1.5px 0 0 rgba(255,255,255,0.85) inset, 0 -1px 0 0 rgba(0,0,0,0.04) inset',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-full"
          style={{ background: 'rgba(0,0,0,0.06)' }}
          aria-label="Cerrar"
        >
          <X size={15} strokeWidth={1.5} />
        </button>

        {/* Image — taller */}
        {featuredArticle.imageUrl && (
          <div className="relative overflow-hidden" style={{ height: '260px' }}>
            <img
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Subtle scrim at bottom */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)' }}
            />
            {/* Category pill on image */}
            {featuredCategory && (
              <span
                className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white px-3 py-1.5"
                style={{
                  borderRadius: '100px',
                  background: 'rgba(135,32,117,0.85)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {featuredCategory.name}
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-7 pt-5 pb-6">
          {/* Date */}
          <p className="text-[11px] font-medium text-gray-400 tracking-wide mb-3">
            {featuredArticle.date}
          </p>

          {/* Title */}
          <h3
            className="text-[19px] font-semibold text-gray-900 leading-snug mb-3"
            style={{ letterSpacing: '-0.015em' }}
          >
            {featuredArticle.title}
          </h3>

          {/* Excerpt */}
          {featuredArticle.excerpt && (
            <p className="text-[13px] leading-relaxed mb-6"
               style={{ color: 'rgba(0,0,0,0.5)' }}>
              {featuredArticle.excerpt}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReadMore}
              className="group flex-1 text-white text-[12px] font-semibold rounded-full pl-5 pr-1.5 py-1.5 flex items-center justify-between gap-3 transition-all duration-300"
              style={{ background: '#872075' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6a195c')}
              onMouseLeave={e => (e.currentTarget.style.background = '#872075')}
            >
              <span>Leer publicación</span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:-rotate-45"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <ArrowRight size={13} />
              </div>
            </button>
            <button
              onClick={dismiss}
              className="text-[12px] font-medium transition-colors duration-200 px-3 py-2"
              style={{ color: 'rgba(0,0,0,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.4)')}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
