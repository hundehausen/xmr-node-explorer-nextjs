import { Radio, RadioGroup, Stack } from '@chakra-ui/react';
import { Network } from '@prisma/client';

interface NetworkSelectorProps {
  network: Network;
  setNetwork: (network: Network) => void;
}

const NetworkSelector = ({ network, setNetwork }: NetworkSelectorProps) => {
  const handleNetworkChange = (nextValue: string) =>
    setNetwork(Network[nextValue as keyof typeof Network]);

  return (
    <Stack direction="row" paddingLeft={8}>
      <RadioGroup onChange={handleNetworkChange} value={network}>
        <Stack direction="row">
          <Radio value={Network.MAINNET}>Mainnet</Radio>
          <Radio value={Network.STAGENET}>Stagenet</Radio>
          <Radio value={Network.TESTNET}>Testnet</Radio>
        </Stack>
      </RadioGroup>
    </Stack>
  );
};

export default NetworkSelector;
