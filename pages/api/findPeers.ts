import type { NextApiRequest, NextApiResponse } from 'next';
import { findNodePeers } from './nodeService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { id } = req.query;
    const nodes = await findNodePeers(Number(id));
    res.status(200).json(nodes);
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
