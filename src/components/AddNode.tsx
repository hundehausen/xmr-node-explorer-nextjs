import { Box, Button, Heading, Input, Wrap, WrapItem } from '@chakra-ui/react';
import { SetStateAction, useState } from 'react';
import { Node } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import MoneroButton from './MoneroButton';

type ErrorResponse = {
  response: {
    data: {
      error: string;
    };
  };
};

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

  const mutation = useMutation<Node, ErrorResponse, Partial<Node>, unknown>(
    ['nodes'],
    (newNode) => axios.post(`/api/nodes`, newNode)
  );

  const handleSubmit = () => {
    mutation.mutate(
      { url, port },
      {
        onSuccess: () => {
          setUrl('');
          setPort(18089);
          queryClient.invalidateQueries(['nodes']);
          toast.success('Node added successfully');
        },
        onError(error, variables, context) {
          console.error(error.response.data.error, variables, context);
          toast.error(error.response.data.error);
        },
      }
    );
  };

  return (
    <Box p={5} m={5} shadow="md" borderWidth="1px">
      <div>
        <Toaster />
      </div>
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
          <MoneroButton
            onClick={handleSubmit}
            disabled={!url || !port}
            isLoading={mutation.isLoading}
            minWidth={110}
          >
            Submit
          </MoneroButton>
        </WrapItem>
      </Wrap>
    </Box>
  );
};

export default AddNode;
