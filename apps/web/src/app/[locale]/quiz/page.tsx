import { getTranslations, setRequestLocale } from 'next-intl/server';
import { QuizHub } from '@/components/quiz/QuizHub';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quiz' });
  return { title: t('title'), description: t('intro') };
}

/** Quiz Wydadi: daily challenge, categories, local scores */
export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale === 'ar' || locale === 'fr' ? locale : 'en';
  return <QuizHub lang={lang} />;
}
