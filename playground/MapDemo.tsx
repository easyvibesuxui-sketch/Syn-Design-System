import { useState } from 'react';
import { MapControls, MapExpandButton, MapLayerSwitch, MapStreetViewButton, MapView, MapZoomControls, type MapLayer } from '../src';
import sample from './assets/map-sample.png';

/** Figma "Equipment Map" with its controls, on a static map image (any map library can fill the frame). */
export function MapDemo() {
  const [layer, setLayer] = useState<MapLayer>('map');
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(true);
  return (
    <div className="pg-map">
      {open ? (
        <MapView
          label="Equipment map"
          onClose={() => setOpen(false)}
          controls={(
            <MapControls>
              <MapStreetViewButton />
              <MapLayerSwitch value={layer} onChange={setLayer} />
              <MapZoomControls
                onZoomIn={() => setZoom((z) => Math.min(2, z + 0.25))}
                onZoomOut={() => setZoom((z) => Math.max(1, z - 0.25))}
                canZoomIn={zoom < 2}
                canZoomOut={zoom > 1}
              />
            </MapControls>
          )}
        >
          <img src={sample} alt="" style={{ transform: `scale(${zoom})`, filter: layer === 'satellite' ? 'saturate(0.3) brightness(0.8)' : undefined }} />
        </MapView>
      ) : (
        <button type="button" className="pg-map__reopen" onClick={() => setOpen(true)}>Open map</button>
      )}
      <div className="pg-map__parts">
        <MapExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
        <MapZoomControls onZoomIn={() => undefined} onZoomOut={() => undefined} />
        <MapLayerSwitch value="map" onChange={() => undefined} />
        <MapLayerSwitch value="satellite" onChange={() => undefined} />
      </div>
    </div>
  );
}
