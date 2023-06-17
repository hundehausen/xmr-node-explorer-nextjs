import dynamic from 'next/dynamic';
import type { GetServerSideProps, NextPage } from 'next';
import { useMemo } from 'react';
import { prisma } from 'lib/prisma';
import Footer from 'components/Footer';
import Head from 'next/head';
import { Box, Heading } from '@chakra-ui/react';
import Link from 'next/link';

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
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>Portemonero Node Map</title>
        <meta name="description" content="Yet Another Monero Node Explorer." />
        <meta property="og:title" content="Portemonero Node Map" />
        <meta
          property="og:description"
          content="Yet Another Monero Node Explorer."
        />
        <meta
          property="og:url"
          content="https://explorer.portemonero.com/map"
        />
        <meta property="og:type" content="website" />
      </Head>
      <Box p={8}>
        <Link href="/">
          <Heading
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            bgClip="text"
            marginBottom={2}
          >
            Portemonero Node Map
          </Heading>
        </Link>
        <Map nodes={nodes} />
      </Box>
      <Footer />
    </>
  );
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
