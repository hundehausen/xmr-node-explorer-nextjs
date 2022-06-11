import type { InferGetServerSidePropsType, NextPage } from 'next';
import { Node } from '@prisma/client';
import NodeTable from '../components/NodeTable';
import { Box, Button, Container } from '@chakra-ui/react';
import useSWR from 'swr';
import { AddNode } from '../components/AddNode';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = (props) => {
  const { data, error } = useSWR<Node[]>('/api/nodes?update=true', fetcher);

  if (error) return <div>An error occured.</div>;
  if (!data) return <div>Loading ...</div>;

  return (
    <Box p={4}>
      <AddNode />
      <NodeTable nodes={data} />
    </Box>
  );
};

export default Home;
