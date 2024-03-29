import { Network, Node } from '@prisma/client';
import { Prisma } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import fetchJsonRpc from 'lib/jsonRpcFetcher';
import { prisma } from 'lib/prisma';
export interface IInfo {
  height: number;
  nettype: string;
  status: string;
  version: string;
}

interface IGetNodeInfo {
  info: IInfo | null;
  ip: string | null;
  webCompatible: boolean;
  reachable: boolean;
  time: Date;
  responseTime: number;
}

export const getNodeInfo = async (
  node: Partial<Node>,
): Promise<IGetNodeInfo> => {
  try {
    const response = await fetchJsonRpc(node, 'get_info');

    if (!response) {
      return {
        info: null,
        ip: null,
        webCompatible: false,
        reachable: false,
        time: new Date(),
        responseTime: -1,
      };
    }

    if (response.data.error) {
      console.warn(response.data.error);
      return {
        info: null,
        ip: response.request.socket.remoteAddress,
        webCompatible: false,
        reachable: false,
        time: new Date(),
        responseTime: response.duration ?? -1,
      };
    }

    if (response.data.result) {
      const webCompatible =
        response?.headers['access-control-allow-origin'] === '*';
      return {
        info: response.data.result,
        ip: response.request.socket.remoteAddress,
        webCompatible,
        reachable: true,
        time: new Date(),
        responseTime: response.duration ?? -1,
      };
    }
    return {
      info: null,
      ip: response.request.socket.remoteAddress,
      webCompatible: false,
      reachable: false,
      time: new Date(),
      responseTime: response.duration ?? -1,
    };
  } catch (error) {
    console.warn(error);
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError;
      if (serverError && serverError.response) {
        console.warn(serverError.response.data);
      }
    }
    return {
      info: null,
      ip: null,
      webCompatible: false,
      reachable: false,
      time: new Date(),
      responseTime: -1,
    };
  }
};

export const getNodeVersion = async (node: Partial<Node>): Promise<string> => {
  try {
    const response = await fetchJsonRpc(node, 'get_version');

    if (!response) {
      return '';
    }

    if (response.data.error) {
      console.warn(response.data.error);
      return '';
    }

    if (response.data?.result) {
      const { version } = response.data.result;
      switch (version) {
        case 196617:
          return '0.17.3.2';
        case 196618:
          return '0.18.0.0';
        default:
          return version.toString();
      }
    }

    return '';
  } catch (error) {
    console.warn(error);
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError;
      if (serverError && serverError.response) {
        console.warn(serverError.response.data);
      }
    }
    return '';
  }
};

export const getFeeEstimation = async (
  node: Partial<Node>,
): Promise<number> => {
  try {
    const response = await fetchJsonRpc(node, 'get_fee_estimate');

    if (!response) return -1;

    if (response.data.error) {
      console.warn(response.data.error);
      return -1;
    }

    if (response.data?.result) {
      const { fee } = response.data.result;
      return fee;
    }

    return -1;
  } catch (error) {
    console.warn(error);
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError;
      if (serverError && serverError.response) {
        console.warn(serverError.response.data);
      }
    }
    return -1;
  }
};

export interface IWhiteListPeersGeneral {
  host: string;
  id: number;
  ip: number;
  last_seen: number;
  port: number;
  rpc_port?: number;
}

export const findNodePeers = async (id: number): Promise<Node[]> => {
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
      const addedNodes: Node[] = [];
      for await (const node of nodes) {
        const result = await getNodeInfo(node);
        if (result?.info) {
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
          if (info.status === 'OK' && ip) {
            const countyObject = await getCountryFromIpAddress(ip);
            addedNodes.push({
              ip: ip,
              port: node.port || -1,
              height: height,
              network: network,
              lastSeen: new Date(),
              url: ip,
              country: countyObject.countryName,
              countryCode: countyObject.countryCode,
              latitude: new Prisma.Decimal(countyObject.latitude),
              longitude: new Prisma.Decimal(countyObject.longitude),
            } as Node);
          }
        }
      }
      return addedNodes;
    }
    return [];
  } catch (error) {
    console.warn(error);
    throw error;
  }
};

export interface ICountries {
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export const getCountryFromIpAddress = async (
  ip: string,
): Promise<ICountries> => {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    if (response?.data?.country_name) {
      return {
        countryName: response.data.country_name,
        countryCode: response.data.country,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
      };
    }
    return {
      countryName: 'unknown',
      countryCode: 'unknown',
      latitude: 0,
      longitude: 0,
    };
  } catch (error) {
    console.warn(error);
    throw error;
  }
};

export const updateNodes = async (nodes: Partial<Node>[]) => {
  for await (const node of nodes) {
    const infoResult = await getNodeInfo({ url: node.url, port: node.port });

    if (infoResult.info) {
      const { info, ip, webCompatible } = infoResult;
      const { height } = info;

      if (info.status === 'OK') {
        /* const version = await getNodeVersion({
          url: node.url,
          port: node.port,
        }); */

        const fee = await getFeeEstimation({
          url: node.url,
          port: node.port,
        });

        let country = node.country;
        let countryCode = node.countryCode;
        let latitude = node.latitude;
        let longitude = node.longitude;
        if (
          ip &&
          (!node.country ||
            !node.countryCode ||
            !node.latitude ||
            !node.longitude)
        ) {
          const countyObject = await getCountryFromIpAddress(ip);
          country = countyObject.countryName;
          countryCode = countyObject.countryCode;
          latitude = new Prisma.Decimal(countyObject.latitude);
          longitude = new Prisma.Decimal(countyObject.longitude);
        }

        await prisma.node.update({
          where: { id: node.id },
          data: {
            height: height,
            ip: ip ?? undefined,
            lastSeen: new Date(),
            // version: version,
            fee: fee,
            country: country,
            countryCode: countryCode,
            latitude: latitude,
            longitude: longitude,
            webCompatible: webCompatible,
          },
        });
      }
    }

    if (!node.id) return;

    const { reachable, time, responseTime } = infoResult;

    await prisma.heartbeat.create({
      data: {
        time,
        reachable,
        responseTime,
        nodeId: node.id,
      },
    });
  }
};
