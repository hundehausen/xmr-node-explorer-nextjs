import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prisma';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    getHandler(req, res);
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<number>
) => {
  try {
    // deletes nodes that haven't been seen in the last seven days
    const { count } = await prisma.node.deleteMany({
      where: {
        lastSeen: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
      },
    });
    console.log(`Deleted ${count} nodes`);
    res.status(200).json(count);
  } catch (error) {
    console.warn(error);
    res.status(500).json(0);
  }
};
