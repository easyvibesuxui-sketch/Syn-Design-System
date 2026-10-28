import type { SVGProps } from 'react';
import { iconData, type IconName } from '../icons/icon-data';
import { cx } from '../utils';

export type { IconName };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Rendered width and height in px. Figma icons are drawn on a 20px grid. */
  size?: number;
  /** Accessible name. Without one the icon is decorative and hidden from assistive tech. */
  title?: string;
}

export function Icon({ name, size = 20, title, className, ...rest }: IconProps) {
  const icon = iconData[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cx('syn-icon', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
