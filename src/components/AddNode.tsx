import { Box, Button, Heading, Input, Wrap, WrapItem } from '@chakra-ui/react';
import { SetStateAction, useState } from 'react';
import { Node } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

const AddNode = () => {
  const [url, setUrl] = useState('');
  const [port, setPort] = useState(18089);
  const [queryClient] = useState<QueryClient>(useQueryClient());

  const handleUrlChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setUrl(event.target.value);

  const handlePortChange = (event: {
    target: { value: SetStateAction<string> };
  }) => setPort(Number(event.target.value));

  const mutations = useMutation<Response, unknown, Partial<Node>, unknown>(
    ['nodes'],
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
    mutations.mutate(
      { url, port },
      {
        onSuccess: () => {
          setUrl('');
          setPort(18089);
          queryClient.invalidateQueries(['nodes']);
        },
      }
    );
  };

  return (
    <Box p={5} m={5} shadow="md" borderWidth="1px">
      <Heading
        size="md"
        paddingBottom={2}
        bgGradient="linear(to-l, #7928CA, #FF0080)"
        bgClip="text"
      >
        Add a new node
      </Heading>
      <Wrap align="center" spacing={4}>
        <WrapItem>
          <Input
            value={url}
            onChange={handleUrlChange}
            placeholder="URL or IP address"
            size="sm"
            minWidth={160}
            minLength={9}
          />
        </WrapItem>
        <WrapItem>
          <Input
            value={port}
            onChange={handlePortChange}
            placeholder="Port"
            size="sm"
            minWidth={160}
            maxLength={6}
            type="number"
          />
        </WrapItem>
        <WrapItem>
          <Button
            onClick={handleSubmit}
            disabled={!url || !port}
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            textColor={'white'}
            _hover={{
              bgGradient: 'linear(to-r, red.500, yellow.500)',
            }}
            minWidth={110}
          >
            Submit
          </Button>
        </WrapItem>
      </Wrap>
    </Box>
  );
};

export default AddNode;
