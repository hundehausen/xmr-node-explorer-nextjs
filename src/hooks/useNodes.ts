import type { Node } from '@prisma/client';
import { Network } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';

const determineMaxHeight = (nodes: Node[]): number => {
  const allHeights = nodes?.map((node) => node.height) ?? [];
  const largestNum =
    allHeights?.reduce((accumulatedValue, currentValue) => {
      return Math.max(accumulatedValue, currentValue);
    }) || 0;
  return largestNum;
};

export const useNodesQuery = (
  network: Network,
  setMaxHeight: Dispatch<SetStateAction<number>>,
  ssrNodes: string,
) =>
  useQuery<Node[], Error>(
    ['nodes', network],
    () =>
      fetch(`/api/nodes?update=true&network=${network}`).then((res) =>
        res.json(),
      ),
    {
      refetchInterval: 60 * 1000,
      onSuccess: (data) => {
        if (data?.length && setMaxHeight) {
          setMaxHeight(determineMaxHeight(data));
        }
      },
      initialData: () => {
        if (ssrNodes) {
          const allNodes: Node[] = JSON.parse(ssrNodes);
          return allNodes.filter((node) => node.network === network);
        }
      },
    },
  );
