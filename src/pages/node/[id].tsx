import dynamic from 'next/dynamic';
import { Heartbeat, Node } from '@prisma/client';
import { GetServerSideProps } from 'next/types';
import { prisma } from 'lib/prisma';
import { useMemo } from 'react';
import Link from 'next/link';

interface NodeDetailPageProps {
  node?: Node | undefined | null;
  heartbeats?: Heartbeat[] | null;
}

export default function NodeDetailPage({
  node,
  heartbeats,
}: NodeDetailPageProps) {
  const DetailNode = useMemo(
    () =>
      dynamic(() => import('components/DetailNode'), {
        loading: () => <p>Detail information is loading</p>,
        ssr: false,
      }),
    []
  );
  if (!node) {
    return <>404 not found</>;
  }
  return (
    <div className="container mx-auto p-4">
      <Link href="/">Back to node list</Link>
      <DetailNode className="mx-auto" node={node} heartbeats={heartbeats} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  NodeDetailPageProps
> = async ({ params }) => {
  const id = Number(params?.id as string);
  if (!id) {
    return { props: { node: null, heartbeats: null } };
  }
  const node = await prisma?.node.findUnique({
    where: {
      id,
    },
  });
  const heartbeats = await prisma?.heartbeat.findMany({
    where: {
      nodeId: id,
    },
  });
  return JSON.parse(JSON.stringify({ props: { node, heartbeats } }));
};
