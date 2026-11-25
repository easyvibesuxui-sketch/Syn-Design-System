import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Icon, MapControl, MapControls, MapExpandButton, MapLayerSwitch, MapStreetViewButton, MapView, MapZoomControls, type MapLayer,
} from '@syn/design-system';
import satelliteThumb from '../../../assets/map-satellite.png';

type Tool = 'pan' | 'draw' | 'erase';
type LatLng = [number, number];

const BREMEN: LatLng = [53.0793, 8.8017];
const tiles: Record<MapLayer, () => L.Layer> = {
  map: () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }),
  satellite: () => L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: 'Esri',
  }),
};
const shapeStyle: L.PolylineOptions = { color: '#459af7', weight: 2, fillColor: '#459af7', fillOpacity: 0.16 };

/**
 * The geofence map of the Geofence Exit alert (Figma 13564:25033): Syn MapView with Leaflet inside. With `drawable`
 * the tools on the left draw the fence: Hand pans, Polygon adds a corner per click (click the first corner or
 * double-click to close it), Eraser removes the last corner, Bin clears it. Without it (warehouse, project and area
 * exits) the map shows the chosen place's fence.
 */
export function GeofenceMap({ drawable, polygon, onPolygon, center, invalid }: {
  drawable: boolean;
  polygon: LatLng[];
  onPolygon: (points: LatLng[]) => void;
  center?: LatLng;
  invalid?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const base = useRef<L.Layer | null>(null);
  const shape = useRef<L.Polygon | L.Polyline | null>(null);
  const [tool, setTool] = useState<Tool>('pan');
  const [layer, setLayer] = useState<MapLayer>('map');
  const [expanded, setExpanded] = useState(false);
  // While drawing, the open line; `polygon` holds a closed fence.
  const [draft, setDraft] = useState<LatLng[]>([]);
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!el.current) return undefined;
    const m = L.map(el.current, { center: center ?? BREMEN, zoom: 10, zoomControl: false, attributionControl: false, doubleClickZoom: false });
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    base.current?.remove();
    base.current = tiles[layer]().addTo(m);
  }, [layer]);

  // A chosen warehouse, project or area: centre on it and show a circle as its fence.
  useEffect(() => {
    const m = map.current;
    if (!m || drawable || !center) return undefined;
    m.setView(center, 14);
    const fence = L.circle(center, { ...shapeStyle, radius: 400 }).addTo(m);
    return () => { fence.remove(); };
  }, [center, drawable]);

  // Draw the fence (closed) or the line being drawn.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    shape.current?.remove();
    shape.current = null;
    if (!drawable) return;
    if (draft.length) shape.current = L.polyline(draft, { ...shapeStyle, dashArray: '4 4' }).addTo(m);
    else if (polygon.length >= 3) shape.current = L.polygon(polygon, shapeStyle).addTo(m);
  }, [polygon, draft, drawable]);

  useEffect(() => {
    const m = map.current;
    if (!m) return undefined;
    const container = m.getContainer();
    container.classList.toggle('is-drawing', drawable && tool === 'draw');
    if (!drawable || tool !== 'draw') { m.dragging.enable(); return undefined; }
    const finish = (points: LatLng[]) => {
      if (points.length >= 3) onPolygon(points);
      setDraft([]);
      setTool('pan');
    };
    const onClick = (e: L.LeafletMouseEvent) => {
      const points = draftRef.current;
      const p: LatLng = [e.latlng.lat, e.latlng.lng];
      // Clicking near the first corner closes the fence.
      if (points.length >= 3 && m.latLngToContainerPoint(points[0]).distanceTo(e.containerPoint) < 12) { finish(points); return; }
      setDraft([...points, p]);
    };
    const onDouble = () => finish(draftRef.current);
    m.on('click', onClick);
    m.on('dblclick', onDouble);
    return () => { m.off('click', onClick); m.off('dblclick', onDouble); };
  }, [drawable, tool, onPolygon]);

  useEffect(() => { setTimeout(() => map.current?.invalidateSize(), 0); }, [expanded]);

  const startDraw = () => { setDraft([]); setTool('draw'); };
  const erase = () => {
    if (draft.length) setDraft(draft.slice(0, -1));
    else if (polygon.length) onPolygon(polygon.length > 3 ? polygon.slice(0, -1) : []);
  };
  const clear = () => { setDraft([]); onPolygon([]); };

  return (
    <div className={`sam-geo${expanded ? ' is-expanded' : ''}${invalid ? ' is-invalid' : ''}`}>
      <MapView
        label="Geofence map" variant="widget" className="sam-geo__map"
        controls={(
          <MapControls>
            <MapStreetViewButton />
            <MapLayerSwitch value={layer} onChange={setLayer} satelliteSrc={satelliteThumb} panelSide="left" />
            <MapZoomControls onZoomIn={() => map.current?.zoomIn()} onZoomOut={() => map.current?.zoomOut()} />
            <MapExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
          </MapControls>
        )}
      >
        <div ref={el} className="sam-geo__leaflet" />
      </MapView>
      {drawable && (
        <div className="sam-geo__tools" role="toolbar" aria-label="Draw geofence">
          <MapControl icon="hand-drag-open" label="Move the map" aria-pressed={tool === 'pan'} onClick={() => { setDraft([]); setTool('pan'); }} />
          <MapControl icon="create-polygon" label="Draw geofence" aria-pressed={tool === 'draw'} onClick={startDraw} />
          <MapControl icon="erase" label="Remove the last corner" onClick={erase} disabled={!draft.length && !polygon.length} />
          <MapControl icon="trash-bin" label="Delete the geofence" onClick={clear} disabled={!draft.length && !polygon.length} />
        </div>
      )}
      {drawable && tool === 'draw' && (
        <p className="sam-geo__hint" role="status">
          <Icon name="info-circle" size={14} />
          Click to add corners; click the first corner or double-click to close the geofence.
        </p>
      )}
    </div>
  );
}
