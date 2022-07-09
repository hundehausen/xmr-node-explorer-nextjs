import type { NextPage } from 'next';
import { Node } from '@prisma/client';
import NodeTable from '../components/NodeTable';
import { Box, Heading } from '@chakra-ui/react';
import { AddNode } from 'components/AddNode';
import { useQuery } from 'react-query';
import { useEffect, useState } from 'react';

const Home: NextPage = (props) => {
  const { isLoading, isError, data, error } = useQuery<Node[], Error>(
    'nodes',
    async () => {
      return fetch('/api/nodes?update=true').then((res) => res.json());
    }
  );
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect((): void => {
    if (data) {
      const allHeights = data.map((node) => node.height);
      const largestNum = allHeights.reduce((accumulatedValue, currentValue) => {
        return Math.max(accumulatedValue, currentValue);
      });
      setMaxHeight(largestNum);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <Box p={4}>
      <Box>
        <Heading>Portemonero Node Explorer</Heading>
        <AddNode />
      </Box>

      {data && <NodeTable nodes={data} maxHeight={maxHeight} />}
    </Box>
  );
};

export default Home;
