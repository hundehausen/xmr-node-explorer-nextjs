import type { InferGetServerSidePropsType, NextPage } from 'next';
import { Node } from '@prisma/client';
import NodeTable from '../components/NodeTable';
import { Button } from '@chakra-ui/react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = (props) => {
  const { data, error } = useSWR<Node[]>('/api/nodes?update=true', fetcher);

  if (error) return <div>An error occured.</div>;
  if (!data) return <div>Loading ...</div>;

  return (
    <div>
      <NodeTable nodes={data} />
    </div>
  );
};

export default Home;
