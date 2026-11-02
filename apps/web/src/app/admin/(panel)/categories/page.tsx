import { requireAdminPage } from '@/lib/admin/auth';
import { getTaxonomy } from '@/lib/editorial/data';
import { CategoryForm } from '@/components/admin/editorial/CategoryForm';

export const metadata = { title: 'Catégories' };

const empty = { fr: '', ar: '', en: '' };

/**
 * The taxonomy: groups (Football, Other sports, Club) and their categories. Administrators add,
 * rename, describe or deactivate them; a category with articles can't be deleted, only deactivated.
 */
export default async function CategoriesPage() {
  const { supabase } = await requireAdminPage();
  const { groups, categories } = await getTaxonomy(supabase);
  const groupOptions = groups.map((g) => ({ id: g.id, name: g.name.fr }));
  const legacy = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Catégories</h1>
          <p className="mt-1 max-w-3xl text-fg-secondary">
            Les rubriques de l’actualité, rangées par groupe. La description est montrée au rédacteur quand il choisit la catégorie. Désactiver une catégorie la retire de l’éditeur sans toucher aux articles existants.
          </p>
        </div>
        <CategoryForm label="+ Nouveau groupe" groups={groupOptions} value={{ kind: 'group', parentId: null, name: empty, description: empty, sport: null, sort: (groups.at(-1)?.sort ?? 0) + 10, active: true }} />
      </header>

      {groups.map((g) => {
        const list = categories.filter((c) => c.parentId === g.id);
        return (
          <section key={g.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-condensed text-2xl font-extrabold uppercase">
                {g.name.fr} {!g.active && <span className="text-sm font-semibold normal-case text-fg-muted">(désactivé)</span>}
                <span className="ms-2 text-base font-normal normal-case text-fg-muted" dir="rtl">{g.name.ar}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <CategoryForm label="Renommer" groups={groupOptions} value={{ id: g.id, kind: 'group', parentId: null, name: g.name, description: g.description, sport: g.sport, sort: g.sort, active: g.active }} />
                <CategoryForm label="+ Catégorie" groups={groupOptions} value={{ kind: 'category', parentId: g.id, name: empty, description: empty, sport: list[0]?.sport ?? null, sort: (list.at(-1)?.sort ?? 0) + 10, active: true }} />
              </div>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {list.map((c) => (
                <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1 basis-80">
                    <p className="font-semibold text-fg">
                      {c.name.fr}
                      {!c.active && <span className="ms-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">désactivée</span>}
                      <span className="ms-2 text-sm font-normal text-fg-muted">{c.articles} article(s){c.sport ? ` · ${c.sport}` : ''}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-fg-secondary">{c.description.fr || 'Pas de description.'}</p>
                  </div>
                  <CategoryForm label="Modifier" groups={groupOptions} value={{ id: c.id, kind: 'category', parentId: c.parentId, name: c.name, description: c.description, sport: c.sport, sort: c.sort, active: c.active }} />
                </li>
              ))}
              {list.length === 0 && <li className="py-3 text-sm text-fg-muted">Aucune catégorie dans ce groupe.</li>}
            </ul>
          </section>
        );
      })}

      {legacy.length > 0 && (
        <section className="rounded-2xl border border-dashed border-border p-5">
          <h2 className="font-condensed text-xl font-extrabold uppercase text-fg-secondary">Anciennes catégories</h2>
          <p className="mt-1 text-sm text-fg-muted">Thèmes de la première version du site, gardés pour les anciens contenus. Rattachez-les à un groupe pour les réutiliser.</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {legacy.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                <span className="font-semibold">{c.name.fr}</span>
                <span className="text-fg-muted">{c.articles} article(s)</span>
                <CategoryForm label="Modifier" groups={groupOptions} value={{ id: c.id, kind: 'category', parentId: c.parentId, name: c.name, description: c.description, sport: c.sport, sort: c.sort, active: c.active }} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
