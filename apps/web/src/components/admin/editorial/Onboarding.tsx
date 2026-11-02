'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { markOnboarded } from '@/lib/editorial/actions';
import { COVER } from '@/lib/editorial/spec';

const STEPS = [
  { title: 'Bienvenue dans la rédaction', text: 'Cet espace sert à publier les actualités du site du Wydad Athletic Club. Ce guide de 5 étapes vous montre comment faire, sans aide technique.' },
  { title: '1. Lisez les consignes', text: 'La page « Consignes éditoriales » explique le ton, les règles d’écriture, les formats d’image et à quoi sert chaque catégorie. Elle reste accessible à tout moment dans le menu.' },
  { title: '2. Créez un article', text: 'Cliquez sur « Créer un article ». Choisissez d’abord la langue (français, arabe ou anglais) et la catégorie, puis écrivez le titre, le résumé et le texte. Tout est enregistré automatiquement.' },
  { title: '3. Ajoutez l’image', text: `Importez une photo d’au moins ${COVER.width} × ${COVER.height} px : l’outil vous laisse la cadrer, puis la compresse au bon format. Décrivez-la dans le « texte alternatif ».` },
  { title: '4. Prévisualisez et vérifiez', text: '« Prévisualiser et vérifier » montre la vraie page sur ordinateur, tablette et mobile, et contrôle l’affichage. Corrigez ce qui est signalé en rouge.' },
  { title: '5. Publiez ou soumettez', text: 'Cochez la liste de contrôle. Si vous êtes autorisé à publier, cliquez sur « Publier » ; sinon « Soumettre pour relecture » : un administrateur validera l’article.' },
];

/** First-visit tour of the newsroom, shown until the member closes it (stored in admin_users) */
export function Onboarding({ name }: { name: string }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const [pending, start] = useTransition();
  if (!open) return null;
  const close = () => start(async () => {
    await markOnboarded();
    setOpen(false);
  });
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <p className="text-sm font-semibold text-wydad-logo">{step === 0 && name ? `Bonjour ${name}` : `Étape ${step} sur ${STEPS.length - 1}`}</p>
        <h2 id="tour-title" className="mt-1 font-condensed text-3xl font-extrabold uppercase leading-tight text-fg">{s.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-secondary">{s.text}</p>
        <div className="mt-5 flex gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-wydad-logo' : 'bg-border'}`} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={close} disabled={pending} className="text-sm font-semibold text-fg-muted hover:text-fg">
            Passer le guide
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="min-h-11 rounded-lg border border-border px-4 font-semibold text-fg">
                Retour
              </button>
            )}
            {last ? (
              <Link href="/admin/guidelines" onClick={close} className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover">
                Lire les consignes
              </Link>
            ) : (
              <button type="button" onClick={() => setStep(step + 1)} className="min-h-11 rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover">
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
