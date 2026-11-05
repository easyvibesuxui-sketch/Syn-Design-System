import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { CloseGlyph } from './IconButton';
import { Button } from './Button';
import { Tag } from './Tag';
import { FieldMessages } from './FieldMessages';
import type { FieldSize } from './TextField';
import { cx } from '../utils';
import './TextField.css';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Figma "LIst with helper text": a Regular 14 Silver Chalice line under the label. */
  description?: string;
  /** Figma "Select List with icon (or image)": a 20px icon, or a 24px image, before the label. */
  icon?: IconName;
  image?: string;
  /** A 24px colour square before the label (Barrell select). */
  swatch?: string;
  /** Figma "Select List with prefix and suffix": e.g. "$" before and "kg" after the label. */
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Options inside this one: Figma "Barrell" groups, up to three levels (48 / 40 / 36px rows). */
  children?: SelectOption[];
}

export interface OptionListActions {
  /** Figma "Button Text": the text button on the left. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Figma "Action": the Amber button on the right. */
  actionLabel?: string;
  onAction?: () => void;
}

interface Row {
  option: SelectOption;
  level: number;
  group: boolean;
  expanded: boolean;
}

function flatten(options: SelectOption[], expanded: Set<string>, level = 0, out: Row[] = []): Row[] {
  for (const option of options) {
    const group = Boolean(option.children?.length);
    const isOpen = group && expanded.has(option.value);
    out.push({ option, level, group, expanded: isOpen });
    if (isOpen) flatten(option.children!, expanded, level + 1, out);
  }
  return out;
}

function leafValues(option: SelectOption): string[] {
  if (!option.children?.length) return option.disabled ? [] : [option.value];
  return option.children.flatMap(leafValues);
}

function findOption(options: SelectOption[], value: string | undefined): SelectOption | undefined {
  if (value === undefined) return undefined;
  for (const o of options) {
    if (o.value === value) return o;
    const inner = o.children && findOption(o.children, value);
    if (inner) return inner;
  }
  return undefined;
}

/** Keeps leaves whose label matches and the groups that hold them. */
function filterOptions(options: SelectOption[], match: (o: SelectOption) => boolean): SelectOption[] {
  const out: SelectOption[] = [];
  for (const o of options) {
    if (o.children?.length) {
      const kids = filterOptions(o.children, match);
      if (kids.length || match(o)) out.push({ ...o, children: kids.length ? kids : o.children });
    } else if (match(o)) out.push(o);
  }
  return out;
}

function allGroups(options: SelectOption[]): string[] {
  return options.flatMap((o) => (o.children?.length ? [o.value, ...allGroups(o.children)] : []));
}

function CheckMark({ state }: { state: 'on' | 'off' | 'mixed' }) {
  return (
    <span className={cx('syn-option__check', state !== 'off' && 'is-on')} aria-hidden>
      {state === 'on' && (
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6.2 5.6 10.6 15 1.2" stroke="currentColor" strokeWidth="1.8" /></svg>
      )}
      {state === 'mixed' && <span className="syn-option__dash" />}
    </span>
  );
}

export interface OptionListProps {
  options: SelectOption[];
  /** Accessible name of the list. */
  label: string;
  /** Checkboxes and several values (Figma "Multi Select List", "Barrell select"). */
  multiple?: boolean;
  value?: string;
  onSelect?: (value: string) => void;
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  /** Figma "Multi select List 2 column". */
  columns?: 1 | 2;
  /** The footer with a text button and the Amber action (Figma "Buttons"). */
  actions?: OptionListActions;
  /** Figma "Empty": shown when there are no options. Default "Cant find anything" / "Try different keywords". */
  emptyTitle?: ReactNode;
  emptyHint?: ReactNode;
  /** Open groups; uncontrolled with defaultExpanded. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** The row the keyboard is on (driven by Select). */
  activeValue?: string;
  onActiveChange?: (value: string) => void;
  /** Taller lists scroll with a thin Eerie Black bar. Default 320px (six rows). */
  maxHeight?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Figma dropdown list on its own: a white box with a 1px Cultured border, 8px corners and 2px padding;
 * 48px rows in Regular 16, groups that open into 40 and 36px rows, checkboxes for several values, an
 * optional footer and the "Nothing Found" message.
 */
export function OptionList({
  options, label, multiple, value, onSelect, values = [], onValuesChange, columns = 1, actions,
  emptyTitle, emptyHint, expanded, defaultExpanded = [], onExpandedChange,
  activeValue, onActiveChange, maxHeight = 320, id, className, style,
}: OptionListProps) {
  const autoId = useId();
  const listId = id ?? `syn-options-${autoId}`;
  const [innerExpanded, setInnerExpanded] = useState<string[]>(defaultExpanded);
  const open = new Set(expanded ?? innerExpanded);
  const rows = flatten(options, open);
  const tree = options.some((o) => o.children?.length);
  const chosen = new Set(values);

  // Standalone (no Select driving it): the list takes focus and the arrow keys itself.
  const standalone = onActiveChange === undefined;
  const [ownActive, setOwnActive] = useState<string | undefined>(undefined);
  const current = standalone ? ownActive : activeValue;
  const setCurrent = (v: string | undefined) => (standalone ? setOwnActive(v) : v !== undefined && onActiveChange?.(v));
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!current) return;
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(current)}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const toggleGroup = (v: string) => {
    const next = open.has(v) ? [...open].filter((x) => x !== v) : [...open, v];
    if (expanded === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
  };
  const toggleValues = (option: SelectOption) => {
    const leaves = leafValues(option);
    const allOn = leaves.length > 0 && leaves.every((l) => chosen.has(l));
    const next = allOn ? values.filter((v) => !leaves.includes(v)) : [...values, ...leaves.filter((l) => !chosen.has(l))];
    onValuesChange?.(next);
  };
  const stateOf = (option: SelectOption): 'on' | 'off' | 'mixed' => {
    const leaves = leafValues(option);
    const on = leaves.filter((l) => chosen.has(l)).length;
    return on === 0 ? 'off' : on === leaves.length ? 'on' : 'mixed';
  };

  const enabledRows = rows.filter((r) => !r.option.disabled);
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!standalone) return;
    const pos = enabledRows.findIndex((r) => r.option.value === current);
    const row = enabledRows[pos];
    const go = (i: number) => { e.preventDefault(); setCurrent(enabledRows[Math.max(0, Math.min(enabledRows.length - 1, i))]?.option.value); };
    if (e.key === 'ArrowDown') go(pos + 1);
    else if (e.key === 'ArrowUp') go(pos < 0 ? 0 : pos - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(enabledRows.length - 1);
    else if (e.key === 'ArrowRight' && row?.group && !row.expanded) { e.preventDefault(); toggleGroup(row.option.value); }
    else if (e.key === 'ArrowLeft' && row?.group && row.expanded) { e.preventDefault(); toggleGroup(row.option.value); }
    else if ((e.key === 'Enter' || e.key === ' ') && row) {
      e.preventDefault();
      if (row.group && (!multiple || e.key === 'Enter')) toggleGroup(row.option.value);
      else if (multiple) toggleValues(row.option);
      else onSelect?.(row.option.value);
    }
  };

  return (
    <div className={cx('syn-options', columns === 2 && 'syn-options--2col', className)} style={style}>
      <div ref={scrollRef} className="syn-options__scroll" style={{ maxHeight }}>
        {rows.length === 0 ? (
          <div className="syn-options__empty" role="status">
            <p>{emptyTitle ?? <><b>Cant find</b> anything</>}</p>
            <div className="syn-options__empty-row">
              <p>{emptyHint ?? <>Try <b>different keywords</b></>}</p>
              <Icon name="search-empty" size={120} />
            </div>
          </div>
        ) : (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={standalone && current ? `${listId}-${current}` : undefined}
            tabIndex={standalone ? 0 : undefined}
            className="syn-options__list"
            onKeyDown={onListKey}
            onFocus={() => standalone && !current && setCurrent(enabledRows.find((r) => (multiple ? chosen.has(r.option.value) : r.option.value === value))?.option.value ?? enabledRows[0]?.option.value)}
          >
            {rows.map(({ option, level, group, expanded: isOpen }) => {
              const state = multiple ? stateOf(option) : option.value === value ? 'on' : 'off';
              const media = option.image ? <img className="syn-option__media" src={option.image} alt="" />
                : option.swatch ? <span className="syn-option__media" style={{ background: option.swatch }} aria-hidden />
                : option.icon ? <Icon name={option.icon} size={20} className="syn-option__icon" /> : null;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${option.value}`}
                  data-value={option.value}
                  role="option"
                  aria-selected={state === 'on'}
                  aria-checked={multiple ? (state === 'mixed' ? 'mixed' : state === 'on') : undefined}
                  aria-disabled={option.disabled || undefined}
                  aria-expanded={group ? isOpen : undefined}
                  aria-level={tree ? level + 1 : undefined}
                  className={cx('syn-option', `syn-option--l${Math.min(level, 2)}`, group && 'is-group', isOpen && 'is-open',
                    option.value === current && 'is-active', state !== 'off' && 'is-selected', option.disabled && 'is-disabled', option.description && 'has-description',
                    (option.description || option.prefix !== undefined || option.suffix !== undefined || media) && !group && !tree && 'is-plain-hover', tree && 'in-tree')}
                  onMouseEnter={() => !option.disabled && setCurrent(option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (option.disabled) return;
                    if (group && !multiple) toggleGroup(option.value);
                    else if (multiple) toggleValues(option);
                    else onSelect?.(option.value);
                  }}
                >
                  {group && (
                    <span
                      className="syn-option__chevron"
                      aria-hidden
                      onClick={(e) => {
                        if (!multiple) return;
                        e.stopPropagation();
                        toggleGroup(option.value);
                      }}
                    >
                      <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} />
                    </span>
                  )}
                  {multiple && !tree && <CheckMark state={state} />}
                  {media}
                  {option.prefix !== undefined && <span className="syn-option__affix">{option.prefix}</span>}
                  <span className="syn-option__text">
                    <span className="syn-option__label">{option.label}</span>
                    {option.description && <span className="syn-option__hint">{option.description}</span>}
                  </span>
                  {option.suffix !== undefined && <span className="syn-option__affix">{option.suffix}</span>}
                  {multiple && tree && <CheckMark state={state} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {actions && (
        <div className="syn-options__footer">
          {actions.secondaryLabel ? <Button variant="text" onClick={actions.onSecondary}>{actions.secondaryLabel}</Button> : <span />}
          {actions.actionLabel && <Button variant="accent" size="sm" className="syn-options__action" onClick={actions.onAction}>{actions.actionLabel}</Button>}
        </div>
      )}
    </div>
  );
}

export interface DropdownPanelProps {
  children: ReactNode;
  actions?: OptionListActions;
  className?: string;
}

/** A dropdown panel with free content, e.g. the Figma Location / Radius filter with Clear and Save. */
export function DropdownPanel({ children, actions, className }: DropdownPanelProps) {
  return (
    <div className={cx('syn-options', 'syn-options--panel', className)}>
      <div className="syn-options__body">{children}</div>
      {actions && (
        <div className="syn-options__footer">
          {actions.secondaryLabel ? <Button variant="text" onClick={actions.onSecondary}>{actions.secondaryLabel}</Button> : <span />}
          {actions.actionLabel && <Button variant="accent" size="sm" className="syn-options__action" onClick={actions.onAction}>{actions.actionLabel}</Button>}
        </div>
      )}
    </div>
  );
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Text shown while nothing is selected. Defaults to the label. With `searchable`, the hint under the floated label. */
  placeholder?: string;
  /** xs 24px, sm 36px, md 48px, lg 56px. */
  size?: FieldSize;
  /**
   * true (default, as Figma draws the dropdown): only the value shows and the label is for screen readers.
   * false: the label sits inside the field above the value, like TextField. xs always hides it.
   */
  hideLabel?: boolean;
  /** outside: the label sits above the field (Regular 14 Jet, 8px gap; 12 and 4px at sm and xs), as on TextField. */
  labelPosition?: 'inside' | 'outside';
  iconStart?: IconName;
  hint?: string;
  error?: string | string[];
  disabled?: boolean;
  /** Shows Figma's round clear (X) button left of the chevron while a value is selected; called when it is pressed. */
  onClear?: () => void;
  clearLabel?: string;
  /**
   * Figma "Type Search": type in the field to filter the list. The label stands in for the placeholder,
   * floats up in Candy Apple on focus and turns Silver Chalice once a value is chosen.
   */
  searchable?: boolean;
  /** Several values with checkboxes (Figma "Type Multiple" with `searchable`, "Filed several Selected" without). */
  multiple?: boolean;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  /** With `multiple`: the chosen values as removable chips under the field. Default: on unless `searchable`. */
  showTags?: boolean;
  removeTagLabel?: (label: string) => string;
  /** List options: two columns, a footer with actions, the empty message, the scroll height. */
  columns?: 1 | 2;
  listActions?: OptionListActions;
  emptyTitle?: ReactNode;
  emptyHint?: ReactNode;
  maxListHeight?: number;
  /** Groups open when the list opens. */
  defaultExpanded?: string[];
  id?: string;
  className?: string;
}

/**
 * Figma "Dropdown": the standard select, the search and multiple types, chips for several values, and the
 * list variants (icons, prefix and suffix, helper text, groups). Follows the WAI-ARIA combobox pattern.
 */
export function Select({
  label, options, value, defaultValue, onChange, placeholder, size = 'lg', hideLabel = true, labelPosition = 'inside', iconStart, hint, error, disabled,
  onClear, clearLabel = 'Clear', searchable = false, multiple = false, values, defaultValues = [], onValuesChange, showTags,
  removeTagLabel = (l) => `Remove ${l}`, columns = 1, listActions, emptyTitle, emptyHint, maxListHeight, defaultExpanded = [], id, className,
}: SelectProps) {
  const autoId = useId();
  const baseId = id ?? `syn-select-${autoId}`;
  const listId = `${baseId}-list`;
  const messagesId = `${baseId}-messages`;
  const [inner, setInner] = useState(defaultValue);
  const [innerValues, setInnerValues] = useState<string[]>(defaultValues);
  const selected = value ?? inner;
  const chosen = values ?? innerValues;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const invalid = error !== undefined && error.length > 0;
  const tags = multiple && (showTags ?? !searchable);
  const selectedOption = findOption(options, selected);
  const chosenOptions = chosen.map((v) => findOption(options, v)).filter((o): o is SelectOption => Boolean(o));
  const shownLabel = multiple ? chosenOptions[0]?.label : selectedOption?.label;
  const hasValue = multiple ? chosenOptions.length > 0 : Boolean(selectedOption);
  const outside = labelPosition === 'outside';
  const labelInside = !outside && (!hideLabel || searchable) && size !== 'xs';
  const clearable = Boolean(onClear) && hasValue && !disabled;

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => (searchable && q ? filterOptions(options, (o) => o.label.toLowerCase().includes(q)) : options),
    [options, searchable, q],
  );
  // While searching, every group that still holds a match is open.
  const openGroups = searchable && q ? allGroups(visible) : expanded;
  const rows = flatten(visible, new Set(openGroups)).filter((r) => !r.option.disabled);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  });

  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const openList = () => {
    if (disabled) return;
    setOpen(true);
    const current = multiple ? chosen[0] : selected;
    setActive(rows.some((r) => r.option.value === current) ? current : rows[0]?.option.value);
  };
  const choose = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
    close();
  };
  const setChosen = (next: string[]) => {
    if (values === undefined) setInnerValues(next);
    onValuesChange?.(next);
  };
  const clear = () => {
    if (searchable && query) {
      setQuery('');
      input.current?.focus();
      return;
    }
    if (multiple) setChosen([]);
    else if (value === undefined) setInner(undefined);
    onClear?.();
    close();
    (input.current ?? root.current?.querySelector<HTMLButtonElement>('[role="combobox"]'))?.focus();
  };
  const toggleGroup = (v: string) => setExpanded((e) => (e.includes(v) ? e.filter((x) => x !== v) : [...e, v]));
  const activate = (row: Row | undefined) => {
    if (!row) return;
    if (row.group && !multiple) toggleGroup(row.option.value);
    else if (multiple) {
      const leaves = leafValues(row.option);
      const allOn = leaves.every((l) => chosen.includes(l));
      setChosen(allOn ? chosen.filter((v) => !leaves.includes(v)) : [...chosen, ...leaves.filter((l) => !chosen.includes(l))]);
    } else choose(row.option.value);
  };

  // Typeahead (standard type): letters jump to the next option that starts with them.
  const typed = useRef({ text: '', at: 0 });
  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : '') + key.toLowerCase(), at: now };
    const t = typed.current.text;
    const pos = rows.findIndex((r) => r.option.value === active);
    const order = [...rows.slice(pos + 1), ...rows.slice(0, pos + 1)];
    const hit = (t.length > 1 ? rows : order).find((r) => r.option.label.toLowerCase().startsWith(t));
    if (hit) setActive(hit.option.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!searchable && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (!open) openList();
      typeahead(e.key);
      return;
    }
    if (searchable && multiple && e.key === 'Backspace' && query === '' && chosen.length > 0) {
      e.preventDefault();
      setChosen(chosen.slice(0, -1));
      return;
    }
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key) || (e.key === ' ' && !searchable)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    const pos = rows.findIndex((r) => r.option.value === active);
    const row = rows[pos];
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(rows[Math.min(rows.length - 1, pos + 1)]?.option.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(rows[Math.max(0, pos - 1)]?.option.value); }
    else if (e.key === 'Home' && !searchable) { e.preventDefault(); setActive(rows[0]?.option.value); }
    else if (e.key === 'End' && !searchable) { e.preventDefault(); setActive(rows.at(-1)?.option.value); }
    else if (e.key === 'ArrowRight' && row?.group && !row.expanded && !searchable) { e.preventDefault(); toggleGroup(row.option.value); }
    else if (e.key === 'ArrowLeft' && row?.group && row.expanded && !searchable) { e.preventDefault(); toggleGroup(row.option.value); }
    else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) {
      e.preventDefault();
      if (row?.group && multiple && e.key === 'Enter') toggleGroup(row.option.value);
      else activate(row);
    } else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close();
  };

  const counter = multiple && !tags && chosenOptions.length > 1 ? `+${chosenOptions.length - 1}` : null;
  const showClear = !disabled && ((searchable && query.length > 0) || clearable);
  const comboProps = {
    role: 'combobox' as const,
    'aria-labelledby': `${baseId}-label`,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': open,
    'aria-controls': listId,
    'aria-activedescendant': open && active ? `${listId}-${active}` : undefined,
    'aria-invalid': invalid || undefined,
    'aria-describedby': hint || invalid ? messagesId : undefined,
    disabled,
    onKeyDown,
  };
  const chevron = (
    <span className="syn-select__chevron" aria-hidden>
      <Icon name="chevron-down" size={16} />
    </span>
  );

  return (
    <div
      ref={root}
      onKeyDown={(e) => {
        // Escape from anywhere inside (a footer button, a chip) closes the list and returns to the field.
        if (e.key === 'Escape' && open && e.target !== input.current && (e.target as HTMLElement).getAttribute('role') !== 'combobox') {
          e.preventDefault();
          close();
          (input.current ?? root.current?.querySelector<HTMLElement>('[role="combobox"]'))?.focus();
        }
      }}
      className={cx(
        'syn-field', 'syn-select', `syn-field--${size}`, labelInside ? 'syn-select--label' : 'syn-field--no-label',
        searchable && 'syn-select--search', searchable && labelInside && 'syn-field--floating', outside && 'syn-field--outside', multiple && 'syn-select--multiple',
        (searchable ? Boolean(query) || (hasValue && !open) : hasValue) && 'has-value', clearable && 'is-clearable',
        invalid && 'is-invalid', disabled && 'is-disabled', open && 'is-open', className,
      )}
    >
      {!labelInside && (outside
        ? <label id={`${baseId}-label`} htmlFor={baseId} className="syn-field__outer-label">{label}</label>
        : <span id={`${baseId}-label`} className="syn-visually-hidden">{label}</span>)}
      {/* The list is placed from this wrapper, so it opens 2px under the field whatever sits below it. */}
      <div className="syn-select__anchor">
        {searchable ? (
          // Search type: the field is a text box; the chevron opens and closes the list.
          <div className="syn-field__box syn-select__trigger syn-select__trigger--search" onMouseDown={(e) => {
            if (e.target === input.current) return;
            e.preventDefault();
            if (open) close(); else { openList(); input.current?.focus(); }
          }}>
            {iconStart && <Icon name={iconStart} size={20} className="syn-field__icon" />}
            <span className="syn-field__stack">
              {labelInside && <label id={`${baseId}-label`} htmlFor={baseId} className="syn-field__label">{label}</label>}
              <input
                ref={input}
                id={baseId}
                className="syn-field__input syn-select__input"
                autoComplete="off"
                value={open ? query : shownLabel ?? ''}
                placeholder={open ? shownLabel ?? placeholder : placeholder}
                onFocus={() => !open && openList()}
                onMouseDown={() => !open && openList()}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!open) setOpen(true);
                  setActive(undefined);
                }}
                {...comboProps}
              />
            </span>
            {counter && <span className="syn-select__count">{counter}</span>}
            {showClear && <span className="syn-select__clear-slot" aria-hidden />}
            {chevron}
          </div>
        ) : (
          <button
            id={baseId}
            type="button"
            className="syn-field__box syn-select__trigger"
            {...comboProps}
            aria-labelledby={`${baseId}-label ${baseId}`}
            onClick={() => (open ? close() : openList())}
          >
            {iconStart && <Icon name={iconStart} size={20} className="syn-field__icon" />}
            <span className="syn-field__stack">
              {labelInside && <span id={`${baseId}-label`} className="syn-field__label">{label}</span>}
              <span className={cx('syn-select__value', !hasValue && 'is-placeholder')}>
                {shownLabel ?? placeholder ?? label}
              </span>
            </span>
            {counter && <span className="syn-select__count">{counter}</span>}
            {/* Keeps room for the clear button, which sits over this slot as a sibling (a button cannot hold a button). */}
            {showClear && <span className="syn-select__clear-slot" aria-hidden />}
            {chevron}
          </button>
        )}
        {showClear && (
          <button type="button" className={cx('syn-select__clear', searchable && query && 'is-typing')} aria-label={clearLabel} onClick={clear}>
            <CloseGlyph />
          </button>
        )}
        {open && (
          <OptionList
            id={listId}
            className="syn-select__list"
            label={label}
            options={visible}
            multiple={multiple}
            value={selected}
            onSelect={choose}
            values={chosen}
            onValuesChange={setChosen}
            columns={columns}
            actions={listActions && {
              ...listActions,
              onAction: () => { listActions.onAction?.(); close(); },
            }}
            emptyTitle={emptyTitle}
            emptyHint={emptyHint}
            expanded={openGroups}
            onExpandedChange={setExpanded}
            activeValue={active}
            onActiveChange={setActive}
            maxHeight={maxListHeight}
          />
        )}
      </div>
      {tags && chosenOptions.length > 0 && (
        <div className="syn-select__tags">
          {chosenOptions.map((o) => (
            <Tag key={o.value} variant="chip" disabled={disabled} removeLabel={removeTagLabel(o.label)}
              onRemove={disabled ? undefined : () => setChosen(chosen.filter((v) => v !== o.value))}>
              {o.label}
            </Tag>
          ))}
        </div>
      )}
      <FieldMessages id={messagesId} hint={hint} error={error} />
    </div>
  );
}
