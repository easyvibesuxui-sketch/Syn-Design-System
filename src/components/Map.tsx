import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import satelliteThumb from '../assets/map/layer-satellite.png';
import mapThumb from '../assets/map/layer-map.png';
import satelliteThumbLg from '../assets/map/layer-satellite-lg.png';
import mapThumbLg from '../assets/map/layer-map-lg.png';
import streetViewFigure from '../assets/map/street-view.png';
import './Map.css';

export interface MapControlProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Required: map controls are icon-only. */
  label: string;
}

/**
 * Figma "Zoom in" / "Map Button": a 36px white square with 8px corners and a 20px Eerie Black glyph.
 * Hover is Cultured with a 1px Eerie Black border.
 */
export function MapControl({ icon, label, className, type = 'button', ...rest }: MapControlProps) {
  return (
    <button type={type} aria-label={label} title={label} className={cx('syn-map-control', className)} {...rest}>
      <Icon name={icon} size={20} />
    </button>
  );
}

export interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  /** Disables a button at the end of the zoom range. */
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  className?: string;
}

/** Figma "Zoom controls": Zoom in (plus in a circle) over Zoom out, 8px apart. */
export function MapZoomControls({
  onZoomIn, onZoomOut, zoomInLabel = 'Zoom in', zoomOutLabel = 'Zoom out', canZoomIn = true, canZoomOut = true, className,
}: MapZoomControlsProps) {
  return (
    <div role="group" aria-label="Zoom" className={cx('syn-map-zoom', className)}>
      <MapControl icon="plus-in-circle" label={zoomInLabel} onClick={onZoomIn} disabled={!canZoomIn} />
      <MapControl icon="minus-in-circle" label={zoomOutLabel} onClick={onZoomOut} disabled={!canZoomOut} />
    </div>
  );
}

export interface MapExpandButtonProps extends Omit<MapControlProps, 'icon' | 'label'> {
  /** true shows Figma's "Minimize" variant. */
  expanded: boolean;
  expandLabel?: string;
  collapseLabel?: string;
}

/** Figma "Map Button": Default (expand arrows) and Minimize, each with its hover. */
export function MapExpandButton({ expanded, expandLabel = 'Expand map', collapseLabel = 'Minimize map', ...rest }: MapExpandButtonProps) {
  return <MapControl icon={expanded ? 'minimize' : 'expand'} label={expanded ? collapseLabel : expandLabel} aria-pressed={expanded} {...rest} />;
}

export type MapLayer = 'map' | 'satellite';

/** A map detail the user can turn on over the base layer (Terrain, Traffic, Transit…). */
export interface MapOverlayOption {
  id: string;
  label: string;
  /** Thumbnail; the defaults below have drawn ones. */
  src?: string;
}

const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32">${body}</svg>`)}`;

/** Terrain, Traffic and Transit with small drawn thumbnails in Syn colours. */
export const defaultMapOverlays: MapOverlayOption[] = [
  {
    id: 'terrain',
    label: 'Terrain',
    src: svg('<rect width="32" height="32" fill="#eef1e8"/><path d="M0 22c5-6 8-9 12-9s6 4 10 4 6-3 10-6v21H0z" fill="#c9d8b8"/><path d="M0 27c6-4 10-6 15-5s9 3 17-2v12H0z" fill="#a9c294"/><path d="M4 18c4-3 7-5 10-4M18 12c3-2 6-3 10-2" stroke="#fff" stroke-width=".8" fill="none"/>'),
  },
  {
    id: 'traffic',
    label: 'Traffic',
    src: svg('<rect width="32" height="32" fill="#f1f1f1"/><path d="M-2 22 34 10M10 -2l6 36" stroke="#fff" stroke-width="5"/><path d="M-2 22 14 16.7" stroke="#71c562" stroke-width="2.4"/><path d="M14 16.7 34 10" stroke="#ec0808" stroke-width="2.4"/><path d="M10 -2l3 18" stroke="#fe7d00" stroke-width="2.4"/><path d="M13 16l3 18" stroke="#71c562" stroke-width="2.4"/>'),
  },
  {
    id: 'transit',
    label: 'Transit',
    src: svg('<rect width="32" height="32" fill="#f1f1f1"/><path d="M-2 8 34 26M6 34 22 -2" stroke="#fff" stroke-width="4"/><path d="M-2 20h12l8-8h16" stroke="#459af7" stroke-width="2" fill="none"/><rect x="19" y="18" width="9" height="9" rx="2" fill="#459af7"/><path d="M21.5 20.5h4v3h-4zM22 25l-1 1.2M25 25l1 1.2" stroke="#fff" stroke-width=".8" fill="none"/>'),
  },
];

export interface MapLayerSwitchProps {
  /** The layer the map shows now. The switch previews the other one. */
  value: MapLayer;
  onChange: (layer: MapLayer) => void;
  /**
   * sm = the 36px switch of the full map; lg = the 56px switch of the map widget (SAM Overview), with the
   * layer name ("Satellite" / "MAP") on a grey gradient at the bottom.
   */
  size?: 'sm' | 'lg';
  /** Thumbnails; the Figma ones are used by default. */
  satelliteSrc?: string;
  mapSrc?: string;
  /**
   * Map details shown in a panel beside the switch while it is hovered or focused (pass
   * `defaultMapOverlays` for Terrain, Traffic and Transit). Clicking the switch itself still swaps the layer.
   */
  overlays?: MapOverlayOption[];
  /** Ids of the details that are on. */
  activeOverlays?: string[];
  onOverlayToggle?: (id: string, on: boolean) => void;
  /** Which side the panel opens to. left (default) suits controls on the right edge of the map. */
  panelSide?: 'left' | 'right';
  /** Accessible name of the details group. */
  overlaysLabel?: string;
  className?: string;
}

/**
 * Figma layer switch: a 36px thumbnail of the layer you switch to. Satellite has a white border, Map an
 * Eerie Black one; hover lays Silver Chalice at 40% over it. With `overlays`, hovering or focusing it opens
 * a white panel of map details (Terrain, Traffic, Transit) that toggle on and off.
 */
export function MapLayerSwitch({
  value, onChange, size = 'sm', satelliteSrc, mapSrc, overlays, activeOverlays = [], onOverlayToggle, panelSide = 'left',
  overlaysLabel = 'Map details', className,
}: MapLayerSwitchProps) {
  const next: MapLayer = value === 'map' ? 'satellite' : 'map';
  const lg = size === 'lg';
  const src = next === 'satellite' ? satelliteSrc ?? (lg ? satelliteThumbLg : satelliteThumb) : mapSrc ?? (lg ? mapThumbLg : mapThumb);
  const button = (
    <button
      type="button"
      className={cx('syn-map-layer', `syn-map-layer--${next}`, lg && 'syn-map-layer--lg', !overlays && className)}
      aria-label={next === 'satellite' ? 'Show satellite view' : 'Show map view'}
      title={next === 'satellite' ? 'Satellite' : 'Map'}
      onClick={() => onChange(next)}
    >
      <img src={src} alt="" />
      {lg && <span className="syn-map-layer__label" aria-hidden>{next === 'satellite' ? 'Satellite' : 'MAP'}</span>}
    </button>
  );
  if (!overlays || overlays.length === 0) return button;
  return (
    <div className={cx('syn-map-layers', `syn-map-layers--${panelSide}`, lg && 'syn-map-layers--lg', className)}>
      {button}
      <div className="syn-map-layers__panel">
        <div role="group" aria-label={overlaysLabel} className="syn-map-layers__card">
          {overlays.map((o) => {
            const on = activeOverlays.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                className={cx('syn-map-layers__option', on && 'is-on')}
                aria-pressed={on}
                onClick={() => onOverlayToggle?.(o.id, !on)}
              >
                <span className="syn-map-layers__thumb">{o.src && <img src={o.src} alt="" />}</span>
                <span className="syn-map-layers__label">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Figma street view control: the Amber figure on a 36px white button. */
export function MapStreetViewButton({ label = 'Street view', className, type = 'button', ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { label?: string }) {
  return (
    <button type={type} aria-label={label} title={label} className={cx('syn-map-control syn-map-street', className)} {...rest}>
      <img src={streetViewFigure} alt="" width={9} height={20} />
    </button>
  );
}

/** Figma "Zoom in zoom out" corner: the control column bottom right, over a soft dark corner gradient. */
export function MapControls({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('syn-map-controls', className)}>{children}</div>;
}

export interface MapViewProps {
  /** The map itself: any map library's container, or an image. It fills the frame. */
  children: ReactNode;
  /** Usually <MapControls> with the street view, layer switch and zoom. */
  controls?: ReactNode;
  /** Shows Figma's "Close map" button top right. */
  onClose?: () => void;
  closeLabel?: string;
  /** Accessible name of the map region. */
  label: string;
  /** page = Figma "Equipment Map" (4px white frame, 12px corners); widget = the map card (2px Cultured, 8px corners). */
  variant?: 'page' | 'widget';
  className?: string;
}

/**
 * Figma "Equipment Map": the map in a frame with a 4px white border and 12px corners, a "Close map" button
 * top right and the controls bottom right.
 */
export function MapView({ children, controls, onClose, closeLabel = 'Close map', label, variant = 'page', className }: MapViewProps) {
  return (
    <div role="region" aria-label={label} className={cx('syn-map', variant === 'widget' && 'syn-map--widget', className)}>
      <div className="syn-map__canvas">{children}</div>
      {onClose && (
        <button type="button" className="syn-map__close" onClick={onClose}>
          <Icon name="x-in-circle" size={20} />
          {closeLabel}
        </button>
      )}
      {controls}
    </div>
  );
}
