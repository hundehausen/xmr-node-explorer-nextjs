import dynamic from 'next/dynamic';
import { GetServerSideProps, NextPage } from 'next';
import { useMemo } from 'react';
import { prisma } from 'lib/prisma';

interface NextPageProps {
  ssrNodes: string;
}

const MapPage: NextPage<NextPageProps> = ({ ssrNodes }) => {
  const nodes = JSON.parse(ssrNodes);
  const Map = useMemo(
    () =>
      dynamic(() => import('../components/Map'), {
        loading: () => <p>Map is loading</p>,
        ssr: false,
      }),
    []
  );
  return <Map nodes={nodes}></Map>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const nodes = await prisma.node.findMany();
  return {
    props: {
      ssrNodes: JSON.stringify(nodes),
    },
  };
};

export default MapPage;
