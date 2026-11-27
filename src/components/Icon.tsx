import type { SVGProps } from 'react';
import { getIcon, type IconName } from '../icons/icon-data';
import { cx } from '../utils';

export type { IconName };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /**
   * Rendered size in px. Every icon sits on the standard 20 x 20 board, so leave it out for 20 x 20
   * (the illustrations empty-list and search-empty keep their own size; then it scales the longer side).
   */
  size?: number;
  /** Accessible name. Without one the icon is decorative and hidden from assistive tech. */
  title?: string;
}

export function Icon({ name, size, title, className, ...rest }: IconProps) {
  const icon = getIcon(name);
  const scale = size === undefined ? 1 : size / Math.max(icon.width, icon.height);
  return (
    <svg
      width={icon.width * scale}
      height={icon.height * scale}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cx('syn-icon', className)}
      data-icon={name}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
