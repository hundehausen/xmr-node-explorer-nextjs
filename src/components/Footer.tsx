import { Center, SimpleGrid } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Footer = () => {
  const router = useRouter();
  return (
    <Center marginTop={4}>
      <SimpleGrid columns={2} spacing={10} w="300px">
        <Center>
          <Link
            href={'https://github.com/hundehausen/xmr-node-explorer-nextjs'}
            target="_blank"
          >
            GitHub
          </Link>
        </Center>
        {router.pathname === '/' && (
          <Center>
            <Link href={'/map'}>Map</Link>
          </Center>
        )}
        {router.pathname === '/map' && (
          <Center>
            <Link href={'/'}>Node Explorer</Link>
          </Center>
        )}
      </SimpleGrid>
    </Center>
  );
};

export default Footer;
