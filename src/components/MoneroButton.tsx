import { Button } from '@chakra-ui/react';
import Image from 'next/image';
import { MouseEventHandler } from 'react';

import styles from './MoneroButton.module.css';

interface MoneroButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  disabled: boolean;
  isLoading: boolean;
  minWidth: number;
  children?: React.ReactNode;
}

const MoneroIcon = ({ isLoading = false }: { isLoading?: boolean }) => {
  return (
    <div className={isLoading ? styles['rotate'] : ''}>
      <Image
        src="/monero-brands.svg"
        alt="Monero Icon"
        width={20}
        height={20}
      ></Image>
    </div>
  );
};

const MoneroButton = ({
  children,
  disabled,
  isLoading,
  minWidth,
  onClick,
}: MoneroButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      minWidth={minWidth}
      leftIcon={<MoneroIcon isLoading={isLoading} />}
      bgGradient="linear(to-l, #7928CA, #FF0080)"
      textColor={'white'}
      _hover={{
        bgGradient: 'linear(to-r, red.500, yellow.500)',
      }}
    >
      {children}
    </Button>
  );
};

export default MoneroButton;
