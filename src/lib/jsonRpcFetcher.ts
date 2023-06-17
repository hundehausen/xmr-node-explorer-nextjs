import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Node } from '@prisma/client';

type CustomConfig = InternalAxiosRequestConfig<any> & { metadata?: any };

axios.interceptors.request.use(
  (config) => {
    const newConfig: CustomConfig = {
      ...config,
    };
    newConfig.metadata = { startTime: new Date() };
    return newConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type CustomResponse = AxiosResponse<any, any> & {
  config?: any;
  duration?: any;
};

axios.interceptors.response.use(
  (response) => {
    const newRes: CustomResponse = { ...response };
    newRes.config.metadata.endTime = new Date();
    newRes.duration =
      newRes.config.metadata.endTime - newRes.config.metadata.startTime;
    return newRes;
  },
  (error) => {
    const newError = { ...error };
    newError.config.metadata.endTime = new Date();
    newError.duration =
      newError.config.metadata.endTime - newError.config.metadata.startTime;
    return Promise.reject(newError);
  }
);

const fetchJsonRpcSecure = async (
  node: Partial<Node>,
  method: string
): Promise<CustomResponse | undefined> => {
  if (node?.ip) {
    node.url = node.ip;
  }

  if (!node?.url) {
    throw new Error('Node has no url');
  }

  const host = node.url?.replace(/^https?:\/\//, '');

  try {
    const url = `https://${host}:${node.port}/json_rpc`;
    const response = await axios.post(
      url,
      {
        jsonrpc: '2.0',
        id: '0',
        method: method,
        contentType: 'application/json',
      },
      {
        timeout: 2000,
      }
    );

    if (response.status === 200) {
      return response;
    }
  } catch (error) {
    const url = `http://${host}:${node.port}/json_rpc`;
    const response = await axios.post(
      url,
      {
        jsonrpc: '2.0',
        id: '0',
        method: method,
        contentType: 'application/json',
      },
      {
        timeout: 2000,
      }
    );

    if (response.status === 200) {
      return response;
    }

    if (axios.isAxiosError(error)) {
      const serverError = error;
      if (serverError && serverError.response) {
        console.warn(serverError.response.data);
      }
      throw error;
    }
  }
};

export default fetchJsonRpcSecure;
