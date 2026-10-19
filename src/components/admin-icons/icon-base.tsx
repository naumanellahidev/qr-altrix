// Copied from AltRix (src/components/icons/icon-base.tsx) by scripts/gen_solar_icons_for.py.
import { createElement, forwardRef, useId } from "react";
import type { ForwardRefExoticComponent, ReactNode, RefAttributes, SVGProps } from "react";

/** One SVG element: [tag, attributes, children?] — written by scripts/gen_solar_icons.py. */
export type IconElement = [string, Record<string, string>, IconElement[]?];

export interface LucideProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  /** Overrides the drawing's stroke width (Solar draws at 1.5). */
  strokeWidth?: number | string;
  /** Kept for lucide compatibility; the stroke is never scaled. */
  absoluteStrokeWidth?: boolean;
}

export type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
export type IconComponent = LucideIcon;

function render(
  nodes: IconElement[], idSuffix: string, strokeWidth: LucideProps["strokeWidth"], fill: string | undefined,
): ReactNode[] {
  return nodes.map(([tag, attrs, children], i) => {
    const props: Record<string, unknown> = { key: i };
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "id") props.id = v + idSuffix;
      else if (v.startsWith("url(#")) props[k] = v.replace(/\)$/, `${idSuffix})`);
      else if (k === "strokeWidth" && strokeWidth !== undefined) props[k] = strokeWidth;
      else if (k === "fill" && v === "none" && fill && fill !== "none") props[k] = fill;
      else props[k] = v;
    }
    return createElement(tag, props, children ? render(children, idSuffix, strokeWidth, fill) : undefined);
  });
}

function usesIds(nodes: IconElement[]): boolean {
  return nodes.some(([, a, c]) => "id" in a || (c ? usesIds(c) : false));
}

/** Build an icon component with lucide-react's props, drawn from a Solar node tree. */
export function createIcon(name: string, size: number, nodes: IconElement[]): LucideIcon {
  const needsIds = usesIds(nodes);
  const Icon = forwardRef<SVGSVGElement, LucideProps>(function Icon(
    { size: px = 24, strokeWidth, absoluteStrokeWidth: _abs, color, fill, className, children, ...rest }, ref,
  ) {
    const uid = useId();
    const suffix = needsIds ? `-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}` : "";
    return createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: px,
        height: px,
        viewBox: `0 0 ${size} ${size}`,
        fill: fill ?? "none",
        color,
        "aria-hidden": rest["aria-label"] ? undefined : true,
        className: className ? `altrix-icon ${className}` : "altrix-icon",
        "data-icon": name,
        ...rest,
      },
      ...render(nodes, suffix, strokeWidth, fill),
      children,
    );
  });
  Icon.displayName = name;
  return Icon;
}
