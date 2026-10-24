import Image from 'next/image';
import type { CmsPage } from '@/lib/cms/club';

/**
 * A CMS page: title, summary, cover and its blocks. Blocks are plain data (heading, paragraph,
 * quote, image) rendered by the site's own components: no HTML or code comes from the CMS.
 */
export function PageView({ page }: { page: CmsPage }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:pt-16">
      <h1 className="font-condensed text-5xl font-extrabold uppercase italic leading-[0.95] text-fg rtl:not-italic sm:text-6xl">{page.title}</h1>
      {page.summary && <p className="mt-6 text-xl leading-relaxed text-fg sm:text-2xl">{page.summary}</p>}
      {page.cover && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-surface-secondary">
          <Image src={page.cover} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="mt-10 space-y-5 text-lg leading-relaxed text-fg-secondary">
        {page.blocks.map((b, i) => {
          switch (b.type) {
            case 'heading':
              return (
                <h2 key={i} className="pt-4 font-condensed text-3xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">
                  {b.text}
                </h2>
              );
            case 'paragraph':
              return <p key={i}>{b.text}</p>;
            case 'quote':
              return (
                <blockquote key={i} className="border-s-4 border-wydad-logo ps-5 text-xl italic text-fg">
                  <p>{b.text}</p>
                  {b.cite && <footer className="mt-2 text-sm not-italic text-fg-muted">{b.cite}</footer>}
                </blockquote>
              );
            case 'image':
              return (
                <figure key={i}>
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-secondary">
                    <Image src={b.url} alt={b.caption ?? ''} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
                  </div>
                  {b.caption && <figcaption className="mt-2 text-sm text-fg-muted">{b.caption}</figcaption>}
                </figure>
              );
          }
        })}
      </div>
    </article>
  );
}
