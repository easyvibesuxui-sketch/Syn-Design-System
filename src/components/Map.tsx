import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { useButtonTip, type ButtonTipProps } from './Tooltip';
import { cx } from '../utils';
import satelliteThumb from '../assets/map/layer-satellite.png';
import mapThumb from '../assets/map/layer-map.png';
import satelliteThumbLg from '../assets/map/layer-satellite-lg.png';
import mapThumbLg from '../assets/map/layer-map-lg.png';
import streetViewFigure from '../assets/map/street-view.png';
import './Map.css';

export interface MapControlProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'>, ButtonTipProps {
  icon: IconName;
  /** Required: map controls are icon-only. It is also the tooltip (left of the control by default). */
  label: string;
}

/**
 * Figma "Zoom in" / "Map Button": a 36px white square with 8px corners and a 20px Eerie Black glyph.
 * Hover is Cultured with a 1px Eerie Black border.
 */
export function MapControl({
  icon, label, className, type = 'button', tooltip, tooltipPlacement = 'left', tooltipTone, onKeyDown, onMouseLeave, onBlur, onMouseEnter, onFocus, 'aria-describedby': describedBy, ...rest
}: MapControlProps) {
  const { tip, tipProps, tipClass } = useButtonTip(label, { tooltip, tooltipPlacement, tooltipTone }, { onKeyDown, onMouseLeave, onBlur, onMouseEnter, onFocus, 'aria-describedby': describedBy });
  return (
    <button type={type} aria-label={label} className={cx('syn-map-control', tipClass, className)} {...rest} {...tipProps}>
      <Icon name={icon} size={20} />
      {tip}
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
  /** The built-in tooltip ("Satellite" / "Map" by default, left of the switch). */
  tooltip?: ButtonTipProps['tooltip'];
  tooltipPlacement?: ButtonTipProps['tooltipPlacement'];
}

/**
 * Figma layer switch: a 36px thumbnail of the layer you switch to. Satellite has a white border, Map an
 * Eerie Black one; hover lays Silver Chalice at 40% over it.
 */
export function MapLayerSwitch({ value, onChange, size = 'sm', satelliteSrc, mapSrc, className, tooltip, tooltipPlacement = 'left' }: MapLayerSwitchProps) {
  const next: MapLayer = value === 'map' ? 'satellite' : 'map';
  const lg = size === 'lg';
  const label = next === 'satellite' ? 'Show satellite view' : 'Show map view';
  // The large switch already prints the layer name, so it has no tooltip unless one is passed.
  const { tip, tipProps, tipClass } = useButtonTip(label, { tooltip: tooltip ?? (lg ? false : next === 'satellite' ? 'Satellite' : 'Map'), tooltipPlacement }, {});
  const src = next === 'satellite' ? satelliteSrc ?? (lg ? satelliteThumbLg : satelliteThumb) : mapSrc ?? (lg ? mapThumbLg : mapThumb);
  return (
    <button
      type="button"
      className={cx('syn-map-layer', `syn-map-layer--${next}`, lg && 'syn-map-layer--lg', tipClass, className)}
      aria-label={label}
      onClick={() => onChange(next)}
      {...tipProps}
    >
      <img src={src} alt="" />
      {lg && <span className="syn-map-layer__label" aria-hidden>{next === 'satellite' ? 'Satellite' : 'MAP'}</span>}
      {tip}
    </button>
  );
}

/** Figma street view control: the Amber figure on a 36px white button. */
export function MapStreetViewButton({
  label = 'Street view', className, type = 'button', tooltip, tooltipPlacement = 'left', tooltipTone, onKeyDown, onMouseLeave, onBlur, onMouseEnter, onFocus, 'aria-describedby': describedBy, ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> & ButtonTipProps & { label?: string }) {
  const { tip, tipProps, tipClass } = useButtonTip(label, { tooltip, tooltipPlacement, tooltipTone }, { onKeyDown, onMouseLeave, onBlur, onMouseEnter, onFocus, 'aria-describedby': describedBy });
  return (
    <button type={type} aria-label={label} className={cx('syn-map-control syn-map-street', tipClass, className)} {...rest} {...tipProps}>
      <img src={streetViewFigure} alt="" width={9} height={20} />
      {tip}
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

/** Figma "gps-off" (56 x 56), drawn in currentColor. */
function GpsOffGlyph() {
  return (
    <svg width="56" height="58" viewBox="0 0 56 58" fill="none" aria-hidden focusable="false" className="syn-map-empty__icon">
      <path
        fill="currentColor"
        d="M50.746,27.5H56v5H50.866a22.353,22.353,0,0,1-2.507,8.1l-3.821-3.813A18.4,18.4,0,0,0,45.851,30a17.1,17.1,0,0,0-5.194-12.57,17.172,17.172,0,0,0-12.6-5.183,17.9,17.9,0,0,0-6.806,1.311L17.433,9.745a22.358,22.358,0,0,1,8-2.5V2h5.134V7.243a22.62,22.62,0,0,1,13.672,6.613A21.963,21.963,0,0,1,50.746,27.5ZM5.134,10.34,8.358,7.123,50.985,49.66l-3.224,3.217-5.254-5.243a23.035,23.035,0,0,1-11.94,5.123V58H25.433V52.757a22.784,22.784,0,0,1-13.612-6.613A21.83,21.83,0,0,1,5.254,32.5H0v-5H5.254a22.15,22.15,0,0,1,5.015-11.915ZM38.925,44.06l-25.075-24.9A17.206,17.206,0,0,0,10.149,30,17,17,0,0,0,15.4,42.57,17.37,17.37,0,0,0,28.06,47.753,17.616,17.616,0,0,0,38.925,44.06Z"
      />
    </svg>
  );
}

export interface MapEmptyStateProps {
  /** ABC Favorit Expanded Medium 16, Silver Chalice. */
  title?: ReactNode;
  /** Montserrat Medium 16, Silver Chalice. */
  description?: ReactNode;
  className?: string;
}

/**
 * Map "No tracker" view: on Cultured, the 56px gps-off glyph over the title and the description, all Silver
 * Chalice and centred. It fills its container (a MapView frame, or a card body).
 */
export function MapEmptyState({
  title = 'No Tracker attached to this equipment', description = 'No data can be provided', className,
}: MapEmptyStateProps) {
  return (
    <div role="status" className={cx('syn-map-empty', className)}>
      <GpsOffGlyph />
      <p className="syn-map-empty__title">{title}</p>
      <p className="syn-map-empty__text">{description}</p>
    </div>
  );
}
