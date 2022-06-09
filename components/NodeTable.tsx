import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { Node } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';

interface IRows {
  id: number;
  url: string | null;
  port: number;
  country: string | null;
  height: number;
  network: string;
  ip: string;
  lastSeenFromNow: string;
}

interface NodeTableProps {
  nodes: Node[];
}

const NodeTable = ({ nodes }: NodeTableProps) => {
  const rows: IRows[] = nodes.map((node) => ({
    id: node.id,
    url: node.url,
    port: node.port,
    country: node.country,
    height: node.height,
    network: node.network,
    ip: node.ip,
    lastSeenFromNow: formatDistance(new Date(node.lastSeen), new Date(), { addSuffix: true }),
  }));
  const columnKeys: (keyof IRows)[] = [
    'url',
    'port',
    'country',
    'height',
    'network',
    'ip',
    'lastSeenFromNow',
  ];
  const columns = [
    {
      key: 'url',
      label: 'URL',
    },
    {
      key: 'port',
      label: 'Port',
    },
    {
      key: 'country',
      label: 'Country',
    },
    {
      key: 'height',
      label: 'Height',
    },
    {
      key: 'network',
      label: 'Network',
    },
    {
      key: 'ip',
      label: 'IP Address',
    },
    {
      key: 'lastSeenFromNow',
      label: 'Last Seen',
    },
  ];

  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Monero Nodes</TableCaption>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.label}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={row.id}>
              {columnKeys.map((columnKey) => (
                <Td key={columnKey}>{row[columnKey]?.toString() || ""}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default NodeTable;
