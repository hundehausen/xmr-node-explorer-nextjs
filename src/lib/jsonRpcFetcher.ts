import axios, { AxiosResponse } from 'axios';
import { Node } from '@prisma/client';

const fetchJsonRpcSecure = async (
  node: Partial<Node>,
  method: string
): Promise<AxiosResponse<any, any>> => {
  const host = node.url;
  for await (const protocol of ['https', 'http']) {
    const url = `${protocol}://${host}:${node.port}/json_rpc`;
    try {
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
      if (axios.isAxiosError(error)) {
        const serverError = error;
        if (serverError && serverError.response) {
          console.warn(serverError.response.data);
        }
      }
    }
  }

  throw new Error('No response');
};

export default fetchJsonRpcSecure;
