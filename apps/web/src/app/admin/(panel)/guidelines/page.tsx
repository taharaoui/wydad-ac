import Link from 'next/link';
import { requireStaffPage } from '@/lib/admin/auth';
import { getTaxonomy } from '@/lib/editorial/data';
import { CHECKLIST, COVER, COVER_MOBILE, DEVICES, LIMITS, MAX_IMAGE_BYTES } from '@/lib/editorial/spec';

export const metadata = { title: 'Consignes éditoriales' };

function Block({ id, letter, title, children }: { id: string; letter: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
      <h2 className="flex items-center gap-3 font-condensed text-3xl font-extrabold uppercase text-fg">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wydad-logo text-xl text-white" aria-hidden>{letter}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-fg-secondary">{children}</div>
    </section>
  );
}

const Do = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((i) => (
      <li key={i} className="flex gap-2"><span className="font-bold text-emerald-700" aria-hidden>✓</span>{i}</li>
    ))}
  </ul>
);
const Dont = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((i) => (
      <li key={i} className="flex gap-2"><span className="font-bold text-wydad-red" aria-hidden>✕</span>{i}</li>
    ))}
  </ul>
);

/** The newsroom's rules, in one page the journalist can come back to (also summarised in the editor) */
export default async function GuidelinesPage() {
  const { supabase } = await requireStaffPage();
  const { groups, categories } = await getTaxonomy(supabase);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Consignes éditoriales</h1>
        <p className="mt-1 max-w-3xl text-fg-secondary">
          Les règles de publication du site officiel du Wydad Athletic Club. Le CMS vérifie automatiquement une partie d’entre elles ; les autres relèvent de votre jugement de journaliste.
        </p>
        <nav aria-label="Sommaire" className="mt-4 flex flex-wrap gap-2 text-sm">
          {[['#process', 'Publier en 6 étapes'], ['#images', 'A. Images'], ['#writing', 'B. Écriture'], ['#language', 'C. Langue'], ['#categories', 'D. Catégories'], ['#screens', 'E. Écrans']].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-border bg-white px-3 py-1.5 font-semibold text-fg hover:border-wydad-logo">{label}</a>
          ))}
        </nav>
      </header>

      <section id="process" className="rounded-2xl bg-wydad-charcoal p-5 text-white sm:p-7">
        <h2 className="font-condensed text-3xl font-extrabold uppercase">Publier un article en 6 étapes</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Langue et catégorie', 'Une langue par article ; la catégorie décide de la rubrique.'],
            ['Titre et résumé', 'Informatif, sans majuscules ni « !! ». Le résumé dit l’essentiel en 1–2 phrases.'],
            ['Image', `Photo d’au moins ${COVER.width} × ${COVER.height} px, cadrée dans l’outil, avec son texte alternatif.`],
            ['Texte', 'Paragraphes courts, intertitres pour les articles longs, faits vérifiés.'],
            ['Aperçu et vérification', 'La vraie page sur ordinateur, tablette et mobile. Corrigez ce qui est en rouge.'],
            ['Liste de contrôle, puis publier', 'Ou « Soumettre pour relecture » si vous n’êtes pas autorisé à publier.'],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-xl bg-white/10 p-4">
              <span className="font-condensed text-3xl font-extrabold text-white/60">{i + 1}</span>
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-white/80">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <Block id="images" letter="A" title="Images">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-secondary/70 p-4">
            <p className="font-semibold text-fg">Image principale (obligatoire)</p>
            <ul className="mt-2 space-y-1">
              <li><b className="text-fg">{COVER.width} × {COVER.height} px</b>, format 16:9</li>
              <li>WebP ou JPEG, <b className="text-fg">{MAX_IMAGE_BYTES / 1024 / 1024} Mo maximum</b></li>
              <li>L’outil de l’éditeur recadre et compresse pour vous</li>
            </ul>
          </div>
          <div className="rounded-xl bg-surface-secondary/70 p-4">
            <p className="font-semibold text-fg">Version mobile (facultative)</p>
            <ul className="mt-2 space-y-1">
              <li><b className="text-fg">{COVER_MOBILE.width} × {COVER_MOBILE.height} px</b>, format 4:5</li>
              <li>Utile quand le sujet est vertical (portrait d’un joueur)</li>
            </ul>
          </div>
        </div>
        <Do items={['Photos de haute qualité, nettes, bien exposées.', 'Sujet (visage, action) au centre : le site recadre au centre sur les petites vignettes.', 'Texte alternatif : décrire ce que montre la photo, dans la langue de l’article (qui, quoi, où).', 'Photos du club ou dont le club a les droits.']} />
        <Dont items={['Images floues, pixelisées, étirées ou écrasées : l’outil ne les agrandit jamais, et une photo trop petite bloque la publication.', 'Texte, titres ou logos ajoutés sur la photo, sauf justification éditoriale (affiche officielle).', 'Captures d’écran de réseaux sociaux ou photos d’autres médias.']} />
      </Block>

      <Block id="writing" letter="B" title="Écriture">
        <Do items={['Ton de journalisme sportif professionnel.', `Titres clairs et informatifs (${LIMITS.title.recommended} caractères maximum conseillés).`, `Paragraphes courts (moins de ${LIMITS.paragraphWords} mots) ; intertitres au-delà de ${LIMITS.wordsBeforeSubheadings} mots.`, 'Orthographe et grammaire relues.', 'Noms, dates, scores et statistiques vérifiés à la source (feuille de match, communiqué officiel).', 'Toujours donner le contexte : compétition, journée, enjeu.']} />
        <Dont items={['Racolage (« Vous n’allez pas croire… », « !! »).', 'Informations non vérifiées ou rumeurs.', 'Copier un article d’un autre média, même en partie importante : reformulez et citez la source.']} />
      </Block>

      <Block id="language" letter="C" title="Langue">
        <Do items={['Une seule langue par article, choisie explicitement : l’article n’apparaît que dans la version du site de cette langue.', 'Pas de traduction automatique : si l’article doit exister en arabe et en français, rédigez deux articles.', 'L’arabe s’affiche de droite à gauche : écrivez directement dans le champ, la mise en page suit.', 'Terminologie constante : « Wydad Athletic Club » (jamais « Wydad Casablanca »), Botola Pro, Complexe Mohammed V.', 'Noms des joueurs, entraîneurs, équipes et compétitions exacts, écrits de la même façon dans tout l’article.']} />
        <Dont items={['Mélanger les langues sans nécessité (une citation dans sa langue d’origine est acceptée).']} />
      </Block>

      <Block id="categories" letter="D" title="Catégories">
        <p>La catégorie place l’article dans la bonne rubrique. Le sport est déduit de la catégorie.</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-xl border border-border p-4">
              <p className="font-condensed text-xl font-extrabold uppercase text-fg">{g.name.fr}</p>
              <dl className="mt-2 space-y-3">
                {categories.filter((c) => c.parentId === g.id && c.active).map((c) => (
                  <div key={c.id}>
                    <dt className="font-semibold text-fg">{c.name.fr}</dt>
                    <dd className="text-sm">{c.description.fr || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Block>

      <Block id="screens" letter="E" title="Ordinateur, tablette, mobile">
        <p>
          Avant toute publication, « Prévisualiser et vérifier » affiche la vraie page de l’article sur {DEVICES.map((d) => `${d.label.toLowerCase()} (${d.width} px)`).join(', ')} et contrôle automatiquement :
        </p>
        <Do items={['pas de défilement horizontal ;', 'aucun texte ni image qui dépasse de l’écran (mots très longs, adresses collées) ;', 'images chargées, ni déformées ni agrandies ;', 'boutons assez grands pour le doigt ;', 'arabe affiché de droite à gauche sur tous les écrans.']} />
        <p>La publication reste bloquée tant qu’un écran est « À corriger », et toute modification après la vérification demande de la relancer.</p>
        <div className="rounded-xl bg-surface-secondary/70 p-4">
          <p className="font-semibold text-fg">Liste de contrôle avant publication</p>
          <ul className="mt-2 space-y-1">
            {CHECKLIST.map((c) => (
              <li key={c.id}>☐ {c.label}</li>
            ))}
          </ul>
        </div>
      </Block>

      <p className="text-sm text-fg-muted">
        Une question sur ces règles ? Demandez à un administrateur. <Link href="/admin?tour=1" className="font-semibold text-wydad-logo underline">Revoir le guide de démarrage</Link>
      </p>
    </div>
  );
}
