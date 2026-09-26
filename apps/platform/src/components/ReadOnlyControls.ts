import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
function label(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement(child)
          ? label((child.props as { children?: ReactNode }).children)
          : '',
    )
    .join(' ')
    .trim();
}
/** Keep navigation, inspection and exports usable while disabling mutation controls.
 * Server authorization and handler guards remain authoritative. */
export function readOnlyControls(node: ReactNode, readOnly: boolean): ReactNode {
  if (!readOnly) return node;
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<Record<string, unknown>>;
    const props = element.props;
    const children = props.children as ReactNode;
    const next: Record<string, unknown> = {};
    if (typeof element.type === 'string') {
      if (element.type === 'button') {
        const text = String(props['aria-label'] || label(children));
        const view =
          props['data-view-control'] === true ||
          /^(Open|View|Inspect|Export|Download|Preview|Close|Cancel|Stay|Back|Compare|Show|Hide|Find|Search|Zoom|Fit|Continue exploring|See operations|Test this project|Product requirements|Technical design|Version history|Overview|All workflows|Activity|Canvas|Code$|Preview$|Review configuration$|PRD|TRD|index\.html|draft\.ts|[A-Z]+-[EN]\d)/i.test(
            text,
          ) ||
          props.role === 'tab';
        if (!view) next.disabled = true;
      }
      if (
        (element.type === 'input' || element.type === 'textarea') &&
        !/search|find|filter/i.test(String(props['aria-label'] || props.placeholder || ''))
      ) {
        if (['file', 'checkbox', 'radio', 'range', 'color'].includes(String(props.type)))
          next.disabled = true;
        else next.readOnly = true;
        next.onChange = undefined;
      }
      if (element.type === 'select') {
        next.disabled = true;
        next.onChange = undefined;
      }
    } else if (typeof element.type !== 'symbol') {
      next.readOnly = true;
    }
    if (children !== undefined) next.children = readOnlyControls(children, true);
    return cloneElement(element, next);
  });
}
