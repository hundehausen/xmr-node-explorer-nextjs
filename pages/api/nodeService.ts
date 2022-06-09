import { Network, Node } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface IInfo {
  height: number;
  nettype: string;
  status: string;
}

interface IGetNodeInfo {
  info: IInfo;
  ip: string;
}

export const getNodeInfo = async (
  node: Partial<Node>
): Promise<IGetNodeInfo | null> => {
  try {
    const host = node.url || node.ip;
    const url = `http://${host}:${node.port}/json_rpc`;
    const response = await axios.post(url, {
      timeout: 300,
      jsonrpc: '2.0',
      id: '0',
      method: 'get_info',
      contentType: 'application/json',
    });
    if (response?.data?.result) {
      return {
        info: response.data.result,
        ip: response.request.socket.remoteAddress,
      };
    } else {
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError;
      if (serverError && serverError.response) {
        console.warn(serverError.response.data);
      }
    }
    return null;
  }
};

interface IWhiteListPeersGeneral {
  host: string;
  id: number;
  ip: number;
  last_seen: number;
  port: number;
  rpc_port?: number;
}

export const findNodePeers = async (id: number): Promise<Partial<Node>[]> => {
  const startNode = await prisma.node.findUnique({
    where: { id },
  });
  if (!startNode) {
    return [];
  }
  const { url, port } = startNode;
  try {
    const response = await axios.post(`http://${url}:${port}/get_peer_list`);
    if (response?.data?.status === 'OK') {
      const { white_list }: { white_list: IWhiteListPeersGeneral[] } =
        response.data;
      const nodes = white_list
        .filter((peer) => peer.rpc_port)
        .map((peer) => {
          return {
            ip: peer.host,
            port: peer.rpc_port,
          };
        });
      let addedNodes: Node[] = [];
      for (const node of nodes) {
        const result = await getNodeInfo(node);
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
          if (info.status === 'OK') {
            const newNode = await prisma.node.upsert({
              where: {
                ip: ip,
              },
              update: {
                country: '',
                height: height,
                lastSeen: new Date(),
                network: network,
                url: ip,
                port: node.port,
              },
              create: {
                ip: ip,
                country: '',
                height: height,
                lastSeen: new Date(),
                network: network,
                url: ip,
                port: node.port || 0,
              },
            });
            addedNodes.push(newNode);
            console.log('Added node');
          }
        }
      }
      return addedNodes;
    }
    return [];
  } catch (error) {
    console.warn(error);
    return [];
  }
};
