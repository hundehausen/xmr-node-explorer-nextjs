import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Node } from '@prisma/client';

interface MapProps {
  className?: string;
  nodes: Node[];
}

const Map = ({ className, nodes }: MapProps) => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={2}
      scrollWheelZoom={false}
      style={{ height: '500px', width: '100%' }}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {nodes.map((node) => (
        <Marker
          key={node.id}
          position={[Number(node.latitude), Number(node.longitude)]}
        >
          <Popup>
            <ul style={{ listStyleType: 'none' }}>
              <li>URL: {node.url}</li>
              <li>Port: {node.port}</li>
              <li>Height: {node.height}</li>
            </ul>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
