import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import type { IWhiteListPeersGeneral } from './nodeService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const url = req.query.url as string;

    if (!url) {
      res.status(400).json({
        error:
          'Missing url of node. Example for url query param: node.portemonero.com:18081',
      });
      return;
    }

    try {
      const response = await axios.post(`http://${url}/get_peer_list`);
      if (response?.data?.status === 'OK') {
        const { white_list }: { white_list: IWhiteListPeersGeneral[] } =
          response.data;
        res.status(200).json(white_list);
      }
      res.status(500).json({ error: 'Could not get peer list from node' });
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
