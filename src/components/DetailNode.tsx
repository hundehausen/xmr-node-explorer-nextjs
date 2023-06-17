import { clsx, Group, Indicator, LoadingOverlay } from '@mantine/core';
import { Heartbeat, Node } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
import * as R from 'remeda';
import Map from 'components/Map';

interface DetailNodeProps {
  node?: Node;
  heartbeats?:
    | (Heartbeat[] & {
        section?: { reachable: boolean; counter: number };
      })
    | null;
  className?: string;
}

const DetailNode = ({ node, heartbeats, className }: DetailNodeProps) => {
  if (!node || !heartbeats) {
    return <LoadingOverlay visible />;
  }

  const lastSeen = formatDistance(new Date(node.lastSeen), new Date(), {
    addSuffix: true,
  });

  const lastHeartbeat = heartbeats.slice(-1)[0];

  const [reachable, unreachable] = R.partition(
    heartbeats,
    (hb) => hb.reachable
  );

  const reachablePercentage = (reachable.length / heartbeats.length) * 100;

  return (
    <div
      className={clsx(
        className,
        'max-w-4xl rounded-3xl bg-purple-300 flex flex-col p-12'
      )}
    >
      <div className="font-semibold text-3xl">{`${node.url} : ${node.port}`}</div>
      <div className="flex flex-row mt-8">
        <div className="info w-6/12">
          <Group>
            <Indicator
              color={lastHeartbeat.reachable ? 'green' : 'red'}
              position="middle-start"
              offset={-12}
            >
              <p>{`last seen: ${lastSeen}`}</p>
            </Indicator>
          </Group>
          <p>{`response time: ${
            lastHeartbeat.responseTime === -1 ? '-' : lastHeartbeat.responseTime
          } ms`}</p>
          <p>{`ip address: ${node.ip}`}</p>
          <p>{`web compatible: ${node.webCompatible}`}</p>
          <p>{`fee: ${node.fee}`}</p>
          <p>{`reachability (24h): ${reachablePercentage.toPrecision(4)} %`}</p>
        </div>
        <div className="w-full rounded-3xl border-separate overflow-hidden">
          <Map nodes={[node]} />
        </div>
      </div>
    </div>
  );
};

export default DetailNode;
