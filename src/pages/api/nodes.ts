import type { NextApiRequest, NextApiResponse } from 'next';
import { Node, Network, Prisma } from '@prisma/client';
import {
  getFeeEstimation,
  getNodeInfo,
  getCountryFromIpAddress,
  updateNodes,
} from './nodeService';
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
    await updateNodes(nodes);
    const updatedNodes = await prisma.node.findMany({
      where: { network: network },
      orderBy: { lastSeen: 'desc' },
    });
    res.status(200).json(updatedNodes);
  } else {
    res.status(200).json(nodes);
  }
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Node | unknown>
) => {
  const body: Partial<Node> = req.body;
  const port = body.port;
  const url = body?.url?.replace(/^https?:\/\//, '');

  if (!port || !url) {
    res.status(400).json({ error: 'port and url are required' });
    return;
  }

  const infoResult = await getNodeInfo({ url, port });

  if (!infoResult) {
    res.status(500).json({ error: 'Could not get node info' });
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
    res.status(500).json({ error: 'Failed to get node info' });
    return;
  }

  const {
    countryName: country,
    countryCode,
    latitude,
    longitude,
  } = await getCountryFromIpAddress(ip);

  // const version = await getNodeVersion({ url, port });

  const fee = await getFeeEstimation({ url, port });

  const node = await prisma.node.upsert({
    where: {
      nodeIdentifier: {
        url,
        port,
      },
    },
    update: {
      country: country,
      countryCode: countryCode,
      lastSeen: new Date(),
      port: port,
      url: url,
      ip: ip,
      height: height,
      network: network,
      // version: version,
      fee: fee,
      latitude: new Prisma.Decimal(latitude),
      longitude: new Prisma.Decimal(longitude),
    },
    create: {
      country: country,
      countryCode: countryCode,
      lastSeen: new Date(),
      port: port,
      url: url,
      ip: ip,
      height: height,
      network: network,
      // version: version,
      fee: fee,
      latitude: new Prisma.Decimal(latitude),
      longitude: new Prisma.Decimal(longitude),
    },
  });
  res.status(200).json(node);
};
