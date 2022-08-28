import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { Node, Network } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';

interface IRows {
  id: number;
  url: string | null;
  port: number;
  country: string | null;
  height: number;
  network: string;
  ip: string;
  // version: string | null;
  fee: number | null;
  lastSeenFromNow: string;
}

interface NodeTableProps {
  nodes: Node[];
  maxHeight: number;
}

const determineCellColor = (
  value: number,
  columnKey: string,
  maxHeight: number,
  network: string
): string => {
  if (columnKey === 'height') {
    if (value === maxHeight) {
      return 'green';
    }
    return 'black';
  }
  if (columnKey === 'fee') {
    if (value > 20000 && network === Network.MAINNET) {
      return 'red';
    }
  }
  return 'black';
};

const determineFlagIcon = (countryCode: string | null): string => {
  if (countryCode && countryCode !== 'unknown') {
    return getUnicodeFlagIcon(countryCode);
  }
  return '🏴‍☠️';
};

const NodeTable = ({ nodes, maxHeight }: NodeTableProps) => {
  const rows: IRows[] = nodes.map((node) => ({
    id: node.id,
    url: node.url,
    port: node.port,
    country: `${determineFlagIcon(node.countryCode)} ${node.country}`,
    height: node.height,
    network: node.network,
    ip: node.ip,
    // version: node.version,
    fee: node.fee,
    lastSeenFromNow: formatDistance(new Date(node.lastSeen), new Date(), {
      addSuffix: true,
    }),
  }));
  const columnKeys: (keyof IRows)[] = [
    'url',
    'port',
    'country',
    'height',
    'network',
    'ip',
    // 'version',
    'fee',
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
    /* {
      key: 'version',
      label: 'Version',
    }, */
    {
      key: 'fee',
      label: 'Estimated fee',
      tooltip: 'in piconero per byte',
    },
    {
      key: 'lastSeenFromNow',
      label: 'Last Seen',
    },
  ];

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key} title={column.tooltip}>
                {column.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={row.id}>
              {columnKeys.map((columnKey) => (
                <Td
                  color={determineCellColor(
                    row[columnKey] as number,
                    columnKey,
                    maxHeight,
                    row.network
                  )}
                  key={columnKey}
                >
                  {row[columnKey]?.toString() || ''}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default NodeTable;
