import {
  Button,
  Flex,
  Input,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { SetStateAction, useState } from 'react';
import { Network, Node } from '@prisma/client';
import { useMutation } from 'react-query';

export const AddNode = () => {
  const [url, setUrl] = useState('');
  const [country, setCountry] = useState('');
  const [port, setPort] = useState(18089);
  const [network, setNetwork] = useState<Network>(Network.MAINNET);

  const handleUrlChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setUrl(event.target.value);

  const handlePortChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setPort(Number(event.target.value));

  const handleCountryChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setCountry(event.target.value);

  const handleNetworkChange = (nextValue: string) =>
    setNetwork(Network[nextValue as keyof typeof Network]);

  const mutations = useMutation<Response, unknown, Partial<Node>, unknown>(
    'nodes',
    async (newNode) => {
      return fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNode),
      });
    }
  );

  const handleSubmit = () => {
    mutations.mutate({ url, port, country, network });
  };

  return (
    <Flex wrap="wrap" id="flex">
      <Stack spacing={4} direction="row" align="center" w="100%">
        <Input
          value={url}
          onChange={handleUrlChange}
          placeholder="URL or IP address"
          size="sm"
          minWidth={160}
          minLength={9}
        />
        <Input
          value={port}
          onChange={handlePortChange}
          placeholder="Port"
          size="sm"
          minWidth={160}
          maxLength={6}
          type="number"
        />
        <Input
          value={country}
          onChange={handleCountryChange}
          placeholder="Country"
          size="sm"
          minWidth={160}
          maxLength={30}
        />

        <RadioGroup onChange={handleNetworkChange} value={network}>
          <Stack direction="row">
            <Radio value={Network.MAINNET}>Mainnet</Radio>
            <Radio value={Network.STAGENET}>Stagenet</Radio>
            <Radio value={Network.TESTNET}>Testnet</Radio>
          </Stack>
        </RadioGroup>
        <Button
          onClick={handleSubmit}
          disabled={!network || !url || !port}
          colorScheme="blackAlpha"
          minWidth={110}
        >
          Submit
        </Button>
      </Stack>
    </Flex>
  );
};
