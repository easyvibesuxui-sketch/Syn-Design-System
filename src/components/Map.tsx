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
  className?: string;
}

/**
 * Figma layer switch: a 36px thumbnail of the layer you switch to. Satellite has a white border, Map an
 * Eerie Black one; hover lays Silver Chalice at 40% over it.
 */
export function MapLayerSwitch({ value, onChange, size = 'sm', satelliteSrc, mapSrc, className }: MapLayerSwitchProps) {
  const next: MapLayer = value === 'map' ? 'satellite' : 'map';
  const lg = size === 'lg';
  const src = next === 'satellite' ? satelliteSrc ?? (lg ? satelliteThumbLg : satelliteThumb) : mapSrc ?? (lg ? mapThumbLg : mapThumb);
  return (
    <button
      type="button"
      className={cx('syn-map-layer', `syn-map-layer--${next}`, lg && 'syn-map-layer--lg', className)}
      aria-label={next === 'satellite' ? 'Show satellite view' : 'Show map view'}
      title={next === 'satellite' ? 'Satellite' : 'Map'}
      onClick={() => onChange(next)}
    >
      <img src={src} alt="" />
      {lg && <span className="syn-map-layer__label" aria-hidden>{next === 'satellite' ? 'Satellite' : 'MAP'}</span>}
    </button>
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
