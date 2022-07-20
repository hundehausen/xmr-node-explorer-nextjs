import type { NextPage } from 'next';
import { Network, Node } from '@prisma/client';
import { Box, Heading } from '@chakra-ui/react';
import NodeTable from 'components/NodeTable';
import AddNode from 'components/AddNode';
import NetworkSelector from 'components/NetworkSelector';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Head from 'next/head';

const Home: NextPage = () => {
  const [network, setNetwork] = useState<Network>(Network.MAINNET);
  const [maxHeight, setMaxHeight] = useState(0);
  const [queryClient] = useState<QueryClient>(useQueryClient());

  const useNodesQuery = (network: Network) =>
    useQuery<Node[], Error>(
      ['nodes', network],
      () =>
        fetch(`/api/nodes?update=true&network=${network}`).then((res) =>
          res.json()
        ),
      {
        initialData: () => {
          const allNodes = queryClient.getQueryData<Node[]>(['nodes']) ?? [];
          const filtredNodes = allNodes.filter(
            (node) => node.network === network
          );
          return filtredNodes?.length ? filtredNodes : [];
        },
      }
    );

  const { isLoading, isError, data, error } = useNodesQuery(network);

  useEffect(() => {
    if (data?.length) {
      const allHeights = data?.map((node) => node.height) ?? [];
      const largestNum =
        allHeights?.reduce((accumulatedValue, currentValue) => {
          return Math.max(accumulatedValue, currentValue);
        }) || 0;
      setMaxHeight(largestNum);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error?.message}</p>;

  return (
    <Box p={8}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>Portemonero Node Explorer</title>
        <meta name="description" content="Yet Another Monero Node Explorer." />
      </Head>
      <Box>
        <Heading
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          marginBottom={2}
        >
          Portemonero Node Explorer
        </Heading>
        <AddNode />
        <NetworkSelector network={network} setNetwork={setNetwork} />
      </Box>
      {data && <NodeTable nodes={data} maxHeight={maxHeight} />}
    </Box>
  );
};

export default Home;
