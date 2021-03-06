import type { NextApiRequest, NextApiResponse } from 'next';
import { Node, Network } from '@prisma/client';
import { getNodeInfo, getNodeVersion } from './nodeService';
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
  const update = req.query.update as string;
  const network = req.query.network as Network | undefined;

  const nodes = await prisma.node.findMany({
    where: { network: network },
    orderBy: { lastSeen: 'desc' },
  });

  if (update === 'true') {
    nodes.forEach(async (node) => {
      const infoResult = await getNodeInfo({ url: node.url, port: node.port });

      if (infoResult) {
        const { info, ip } = infoResult;
        const { height } = info;

        if (info.status === 'OK') {
          const version = await getNodeVersion({
            url: node.url,
            port: node.port,
          });
          await prisma.node.update({
            where: { id: node.id },
            data: {
              height: height,
              ip: ip,
              lastSeen: new Date(),
              version: version,
            },
          });
        }
      }
    });

    const updatedNodes = await prisma.node.findMany({
      where: { network: network },
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

  const infoResult = await getNodeInfo({ url, port });

  if (!infoResult) {
    res.status(500).end('Failed to get node info');
    return;
  }

  const { info, ip } = infoResult;
  const { height, nettype } = info;

  let network;
  if (nettype === 'mainnet') {
    network = Network.MAINNET;
  } else if (nettype === 'testnet') {
    network = Network.TESTNET;
  } else {
    network = Network.STAGENET;
  }

  if (info.status !== 'OK') {
    res.status(500).end('Failed to get node info');
    return;
  }

  const version = await getNodeVersion({ url, port });

  const node = await prisma.node.upsert({
    where: {
      nodeIdentifier: {
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
      version: version,
    },
    create: {
      country: country,
      lastSeen: new Date(),
      port: port,
      url: url,
      ip: ip,
      height: height,
      network: network,
      version: version,
    },
  });
  res.status(200).json(node);
};
