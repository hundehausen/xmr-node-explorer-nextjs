import type { NextApiRequest, NextApiResponse } from 'next';
import { Node, Network } from '@prisma/client';
import { getNodeInfo } from './nodeService';
import { prisma } from 'lib/prisma';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    getHandler(req, res);
  } else if (req.method === 'POST') {
    postHandler(req, res);
  } else {
    res
      .status(405)
      .end(`Method ${req.method} Not Allowed. Allowed methods: GET, POST`);
  }
}

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Node[]>
) => {
  const { update } = req.query;
  const nodes = await prisma.node.findMany({ orderBy: { lastSeen: 'desc' } });
  if (update?.toString() === 'true') {
    nodes.forEach(async (node) => {
      const result = await getNodeInfo({ url: node.url, port: node.port });
      if (result) {
        const { info, ip } = result;
        const { height, nettype } = info;

        if (info.status === 'OK') {
          await prisma.node.update({
            where: { id: node.id },
            data: {
              height: height,
              lastSeen: new Date(),
            },
          });
        }
      }
    });
    console.log('Updated nodes');
    const updatedNodes = await prisma.node.findMany({
      orderBy: { lastSeen: 'desc' },
    });
    res.status(200).json(updatedNodes);
  } else {
    res.status(200).json(nodes);
  }
};

const postHandler = async (req: NextApiRequest, res: NextApiResponse<Node>) => {
  const body: Partial<Node> = req.body;
  const { country, port, url } = body;
  if (!port || !url) {
    res.status(400).end('Missing required fields');
    return;
  }
  const result = await getNodeInfo({ url, port });
  if (result) {
    const { info, ip } = result;
    const { height, nettype } = info;
    let network;
    if (nettype === 'mainnet') {
      network = Network.MAINNET;
    } else if (nettype === 'testnet') {
      network = Network.TESTNET;
    } else {
      network = Network.STAGENET;
    }

    const node = await prisma.node.upsert({
      where: {
        url_port: {
          url,
          port,
        },
      },
      update: {
        country: country,
        lastSeen: new Date(),
        port: port,
        url: url,
        ip: ip,
        height: height,
        network: network,
      },
      create: {
        country: country,
        lastSeen: new Date(),
        port: port,
        url: url,
        ip: ip,
        height: height,
        network: network,
      },
    });
    res.status(200).json(node);
  } else {
    res.status(500).end('Error getting node info');
  }
};
