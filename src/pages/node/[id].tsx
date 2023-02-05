import { Heartbeat, Node } from '@prisma/client';
import { GetServerSideProps } from 'next/types';
import { prisma } from 'lib/prisma';
import { useRouter } from 'next/navigation';

interface NodeDetailPageProps {
  node: Node | undefined | null;
  heartbeats: Heartbeat[] | undefined;
}

export default function NodeDetailPage({
  node,
  heartbeats,
}: NodeDetailPageProps) {
  const router = useRouter();
  if (!node) {
    return <>404 not found</>;
  }
  return (
    <div className="">
      <div onClick={router.back}>Back to node list</div>
      {JSON.stringify(node)} {JSON.stringify(heartbeats)}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  NodeDetailPageProps
> = async ({ params }) => {
  const id = Number(params?.id as string);
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
