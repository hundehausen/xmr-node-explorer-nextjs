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
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { Node, Network } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
import Link from 'next/link';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useMemo } from 'react';

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

type NodeShape = {
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
};

const columnHelper = createColumnHelper<NodeShape>();

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
  const data: NodeShape[] = nodes.map((node) => ({
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
  /*   const columnKeys: (keyof IRows)[] = useMemo(
    () => [
      'url',
      'port',
      'country',
      'height',
      'network',
      'ip',
      // 'version',
      'fee',
      'lastSeenFromNow',
    ],
    []
  ); */

  const columns = useMemo(
    () => [
      {
        accessor: 'url',
        Header: 'URL',
      },
      {
        accessor: 'port',
        Header: 'Port',
      },
      {
        accessor: 'country',
        Header: 'Country',
      },
      {
        accessor: 'height',
        Header: 'Height',
      },
      {
        accessor: 'network',
        Header: 'Network',
      },
      {
        accessor: 'ip',
        Header: 'IP Address',
      },
      /* {
      accessor: 'version',
      Header: 'Version',
    }, */
      {
        accessor: 'fee',
        Header: 'Estimated fee',
        tooltip: 'in piconero per byte',
      },
      {
        accessor: 'lastSeenFromNow',
        Header: 'Last Seen',
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useReactTable({ columns, data }, useSortBy);

  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>
          <Link
            href={'https://github.com/hundehausen/xmr-node-explorer-nextjs'}
          >
            <a target="_blank">GitHub</a>
          </Link>
        </TableCaption>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.accessor} title={column.tooltip}>
                {column.Header}
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
