import type { NextPage } from 'next';
import { Node } from '@prisma/client';
import NodeTable from '../components/NodeTable';
import { Box, Heading } from '@chakra-ui/react';
import { AddNode } from 'components/AddNode';
import { useQuery } from 'react-query';

const Home: NextPage = (props) => {
  const { isLoading, isError, data, error } = useQuery<Node[], Error>(
    'nodes',
    async () => {
      return fetch('/api/nodes?update=true').then((res) => res.json());
    }
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <Box p={4}>
      <Box>
        <Heading>Portemonero Node Explorer</Heading>
        <AddNode />
      </Box>

      {data && <NodeTable nodes={data} />}
    </Box>
  );
};

export default Home;
