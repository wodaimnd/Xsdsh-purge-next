/** @jsx h */
import React, { h } from "../host/react";

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  "aria-label": string;
  disabled?: boolean;
  /** Popover width follows the trigger by default; pass a number for a wider menu. */
  menuMinWidth?: number;
  className?: string;
  size?: "sm" | "md";
  /** Shown when the current value matches no option (empty/placeholder state). */
  placeholder?: string;
}

interface Placement { left: number; top: number; width: number; maxHeight: number }

/**
 * Custom select that actually renders inside the plugin panel: the native <select>
 * dropdown is drawn by the OS and can escape the embedded window, and it cannot take
 * the theme's accent color. The menu is fixed-positioned from the trigger rect so it
 * is never clipped by a scrolling table, and flips upward when there is no room below.
 */
export function PurgeSelect(props: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(() => Math.max(0, props.options.findIndex(o => o.value === props.value)));
  const [placement, setPlacement] = React.useState<Placement | null>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const listbox = React.useRef<HTMLUListElement>(null);
  const id = React.useId();
  const listId = `${id}-list`;
  const enabledOptions = props.options.filter(o => !o.disabled);
  const selected = props.options.find(o => o.value === props.value);
  const label = selected ? selected.label : props.placeholder ?? "选择…";

  const place = (): Placement | null => {
    const node = trigger.current;
    if (!node || typeof window === "undefined") return null;
    const box = node.getBoundingClientRect();
    const gap = 4;
    const margin = 8;
    const below = window.innerHeight - box.bottom - gap - margin;
    const above = box.top - gap - margin;
    const maxHeight = Math.max(96, Math.min(320, Math.max(below, above)));
    const width = Math.min(Math.max(box.width, props.menuMinWidth ?? 0), Math.max(160, window.innerWidth - margin * 2));
    const up = below < 140 && above > below;
    return {
      left: Math.max(margin, Math.min(box.left, window.innerWidth - width - margin)),
      top: up ? Math.max(margin, box.top - Math.min(maxHeight, above) - gap) : box.bottom + gap,
      width,
      maxHeight,
    };
  };

  React.useEffect(() => {
    if (!open || typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    const inside = (target: EventTarget | null) => {
      const rootNode = root.current;
      if (!rootNode || !target) return false;
      if (typeof Node !== "undefined" && target instanceof Node) return rootNode.contains(target);
      return false;
    };
    const onPointerDown = (event: PointerEvent) => { if (!inside(event.target)) setOpen(false); };
    const onScroll = (event: Event) => { if (!inside(event.target)) setOpen(false); };
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const node = listbox.current?.querySelector<HTMLElement>(`[data-value-index="${highlight}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  const openList = () => {
    if (props.disabled) return;
    setHighlight(Math.max(0, props.options.findIndex(o => o.value === props.value)));
    setPlacement(place());
    setOpen(true);
  };
  const pick = (option: SelectOption) => {
    if (option.disabled) return;
    props.onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (props.disabled) return;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); openList(); }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = enabledOptions[highlight];
      if (option) pick(option);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!enabledOptions.length) return;
      const dir = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      let next = highlight;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = enabledOptions.length - 1;
      else next = (highlight + dir + enabledOptions.length) % enabledOptions.length;
      setHighlight(next);
    }
  };

  const className = "purge-select" + (props.size === "sm" ? " is-sm" : "")
    + (props.className ? " " + props.className : "") + (open ? " is-open" : "");
  return <div ref={root} className={className}>
    <button ref={trigger} type="button" role="combobox" aria-expanded={open} aria-controls={listId} aria-haspopup="listbox"
      aria-label={props["aria-label"]} disabled={props.disabled} className="purge-select-trigger"
      onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKeyDown}>
      <span className="purge-select-label">{label}</span><span className="purge-select-caret" aria-hidden="true">▾</span>
    </button>
    {open && <ul ref={listbox} id={listId} role="listbox" aria-label={props["aria-label"]} className="purge-select-list"
      style={placement ? { position: "fixed", left: placement.left, top: placement.top, width: placement.width, maxHeight: placement.maxHeight } : undefined}>
      {enabledOptions.map((option, index) => <li key={option.value} role="option" aria-selected={option.value === props.value}
        data-value-index={index}
        className={"purge-select-option" + (option.value === props.value ? " is-on" : "") + (index === highlight ? " is-hl" : "")}
        onMouseEnter={() => setHighlight(index)}
        onClick={() => pick(option)}>{option.label}</li>)}
      {!enabledOptions.length && <li className="purge-select-empty">没有可选项</li>}
    </ul>}
  </div>;
}
