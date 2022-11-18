# Portemonero Node Explorer

## Features

- Display the latest block height
- Heighest block height is colored green
- Detects IP address of the node
- Shows last time seen
- Switch between different network types
- Add your favorite nodes
- Check for malicious nodes with high fees (displays fee in piconero per byte)

## Wishlist of features by the community:

- Display the version of the node
- Scan automatically for nodes in the networks
- Display uptime and reliability of the node

## Installation

```
git clone https://github.com/hundehausen/xmr-node-explorer-nextjs.git
cd xmr-node-explorer-nextjs
yarn install
cp .env.example .env
edit .env to your needs
edit prisma/schema.prisma to your needs (you might want change provider to your db type)
docker-compose up
npx prisma migrate dev
yarn dev
```

Go to localhost:3000 in your browser
you can inspect the database with `npx prisma studio`

## Tech Stack

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Chakra-ui](https://chakra-ui.com/)
- [Axios](https://github.com/axios/axios)
- [React Query](https://tanstack.com/query/v4/)
- [Prisma](https://www.prisma.io/)
- [PlanetScale](https://planetscale.com/)

## Donations

[PayPal](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
89HEKdUFM2dJGDFLpV7CoLUW1Swux7iBMMCXMC5y3U2DihmrbYh6AEoanoHb8VPJrCDLTa9FJfooHdz1rGZH9L342TXwZh7
