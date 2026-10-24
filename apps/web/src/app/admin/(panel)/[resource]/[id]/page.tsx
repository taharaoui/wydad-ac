import { notFound } from 'next/navigation';
import { getResource } from '@/lib/admin/resources';
import { EditPage } from '../EditPage';

export async function generateMetadata({ params }: { params: { resource: string } }) {
  return { title: getResource(params.resource)?.label ?? 'Admin' };
}

export default function EditResource({ params, searchParams }: { params: { resource: string; id: string }; searchParams: { saved?: string } }) {
  const resource = getResource(params.resource);
  if (!resource) notFound();
  return <EditPage resource={resource} id={decodeURIComponent(params.id)} saved={searchParams.saved === '1'} />;
}
