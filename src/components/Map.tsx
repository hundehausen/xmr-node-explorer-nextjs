import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Node } from '@prisma/client';
import Footer from './Footer';
import { Box, Heading, Text } from '@chakra-ui/react';

const Map = ({ nodes }: { nodes: Node[] }) => {
  debugger;
  return (
    <>
      <Box p={8}>
        <Heading
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          marginBottom={2}
        >
          Portemonero Node Map
        </Heading>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={2}
          scrollWheelZoom={false}
          style={{ height: '500px', width: '100%' }}
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
      </Box>
      <Footer />
    </>
  );
};

export default Map;
