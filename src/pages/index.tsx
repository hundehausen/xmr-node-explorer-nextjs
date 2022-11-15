import type { GetServerSideProps, NextPage } from 'next';
import { Network } from '@prisma/client';
import { Box, Center, Heading, Spinner } from '@chakra-ui/react';
import NodeTable from 'components/NodeTable';
import AddNode from 'components/AddNode';
import NetworkSelector from 'components/NetworkSelector';
import { useState } from 'react';
import Head from 'next/head';
import { prisma } from 'lib/prisma';
import { useNodesQuery } from 'hooks/useNodes';
import Footer from 'components/Footer';
import Link from 'next/link';

interface NextPageProps {
  ssrNodes: string;
}

const Home: NextPage<NextPageProps> = ({ ssrNodes }) => {
  const [network, setNetwork] = useState<Network>(Network.MAINNET);
  const [maxHeight, setMaxHeight] = useState(0);

  const { isLoading, isError, data, error } = useNodesQuery(
    network,
    setMaxHeight,
    ssrNodes
  );

  return (
    <Box p={8}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>Portemonero Node Explorer</title>
        <meta name="description" content="Yet Another Monero Node Explorer." />
        <meta property="og:title" content="Portemonero Node Explorer" />
        <meta
          property="og:description"
          content="Yet Another Monero Node Explorer."
        />
        <meta property="og:url" content="https://explorer.portemonero.com/" />
        <meta property="og:type" content="website" />
      </Head>
      <Box>
        <Link href="/">
          <Heading
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            bgClip="text"
            marginBottom={2}
            marginLeft={5}
          >
            Portemonero Node Explorer
          </Heading>
        </Link>

        <AddNode />
        <NetworkSelector network={network} setNetwork={setNetwork} />
      </Box>
      {isLoading && (
        <Center height="100px">
          <Spinner color="red.500" />
          <p>Loading...</p>
        </Center>
      )}
      {isError && <p>Error: {error?.message}</p>}
      {data && <NodeTable nodes={data} maxHeight={maxHeight} />}
      <Footer />
    </Box>
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

export default Home;
