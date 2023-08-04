import type { NextApiRequest, NextApiResponse } from 'next';

import { findNodePeers } from './nodeService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const id = req.query.id as string;
    const addToDb = req.query.addToDb as string;

    if (!id) {
      res.status(400).json({
        error:
          'Missing id of starting node. Check your database for the id of a node.',
      });
      return;
    }

    try {
      const nodes = await findNodePeers(parseInt(id));
      res.status(200).json(nodes);

      if (process?.env.NODE_ENV === 'development' && addToDb === 'true') {
        await prisma?.node.createMany({ data: nodes });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
