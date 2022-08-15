import type { NextPage } from 'next';
import { Network, Node } from '@prisma/client';
import { Box, Center, Heading, Spinner } from '@chakra-ui/react';
import NodeTable from 'components/NodeTable';
import AddNode from 'components/AddNode';
import NetworkSelector from 'components/NetworkSelector';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Head from 'next/head';

const Home: NextPage = () => {
  const [network, setNetwork] = useState<Network>(Network.MAINNET);
  const [maxHeight, setMaxHeight] = useState(0);

  const useNodesQuery = (network: Network) =>
    useQuery<Node[], Error>(
      ['nodes', network],
      () =>
        fetch(`/api/nodes?update=true&network=${network}`).then((res) =>
          res.json()
        ),
      {
        refetchInterval: 60 * 1000,
        onSuccess: (data) => {
          if (data?.length) {
            const allHeights = data?.map((node) => node.height) ?? [];
            const largestNum =
              allHeights?.reduce((accumulatedValue, currentValue) => {
                return Math.max(accumulatedValue, currentValue);
              }) || 0;
            setMaxHeight(largestNum);
          }
        },
      }
    );

  const { isLoading, isError, data, error } = useNodesQuery(network);

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
        <Heading
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          marginBottom={2}
          marginLeft={5}
        >
          Portemonero Node Explorer
        </Heading>
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
    </Box>
  );
};

export default Home;
