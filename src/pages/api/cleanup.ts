import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prisma';
import { updateNodes } from './nodeService';
import { Network } from '@prisma/client';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    deleteHandler(req, res);
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ deletedNodes: number; message: string }>
) => {
  const authorizationHeader = req.headers['authorization'];

  if (authorizationHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    res.status(401).end('Unauthorized');
    return;
  }

  try {
    // first update the nodes
    const nodes = await prisma.node.findMany({});
    updateNodes(nodes);
    // the nodes with highest height
    const mostRecentMainnetNode = nodes
      .filter((node) => node.network === Network.MAINNET)
      .reduce((prev, current) =>
        prev.height > current.height ? prev : current
      );
    const { count } = await prisma.node.deleteMany({
      where: {
        OR: [
          {
            // delete nodes that lack haven't been online for 7 days
            lastSeen: {
              lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            },
          },
          {
            // delete nodes that lack 120 blocks behind
            AND: [
              {
                height: {
                  lt: mostRecentMainnetNode.height - 120,
                },
              },
              {
                network: {
                  equals: Network.MAINNET,
                },
              },
            ],
          },
        ],
      },
    });
    const message =
      count === 0 ? `No nodes were deleted` : `Deleted ${count} nodes`;
    console.log(message);
    res.status(200).json({
      deletedNodes: count,
      message: message,
    });
  } catch (error) {
    console.warn(error);
    res.status(500).end('Failed to delete unavailable nodes.');
  }
};
