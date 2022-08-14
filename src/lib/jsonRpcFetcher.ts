import axios, { AxiosResponse } from 'axios';
import { Node } from '@prisma/client';

const fetchJsonRpc = async (
  node: Partial<Node>,
  method: string
): Promise<AxiosResponse<any, any>> => {
  const host = node.url || node.ip;
  const protocol = node.port === 443 ? 'https' : 'http';
  const url = `${protocol}://${host}:${node.port}/json_rpc`;
  return axios.post(
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
};

export default fetchJsonRpc;
