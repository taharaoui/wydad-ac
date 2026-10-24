import { notFound } from 'next/navigation';
import { getResource } from '@/lib/admin/resources';
import { EditPage } from '../EditPage';

export async function generateMetadata({ params }: { params: { resource: string } }) {
  const r = getResource(params.resource);
  return { title: r ? `Ajouter : ${r.singular}` : 'Admin' };
}

export default function NewResource({ params }: { params: { resource: string } }) {
  const resource = getResource(params.resource);
  if (!resource || resource.canCreate === false || resource.singleton) notFound();
  return <EditPage resource={resource} id={null} />;
}
