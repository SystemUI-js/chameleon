import React from 'react';

type BaseProps = {
  children?: React.ReactNode;
  style?: unknown;
  testID?: string;
  accessibilityLabel?: string;
  className?: string;
  role?: string;
  tabIndex?: number;
  id?: string;
  hidden?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  name?: string;
  value?: string;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  onContextMenu?: React.MouseEventHandler<HTMLElement>;
  onScroll?: React.UIEventHandler<HTMLElement>;
  'data-menu-state'?: string;
  'data-menu-depth'?: number;
  'data-menu-item-id'?: string;
  'data-menu-item-key'?: string;
  'data-menu-item-type'?: string;
  'data-system-type'?: string;
  'data-theme'?: string;
  'aria-label'?: string;
  'aria-checked'?: boolean;
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  'aria-labelledby'?: string;
  'aria-selected'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-hidden'?: boolean;
  'data-scroll-area-content'?: string;
};

type PressableProps = BaseProps & {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
};

function toTestProps(props: BaseProps): Record<string, unknown> {
  return {
    'data-testid': props.testID,
    'aria-label': props['aria-label'] ?? props.accessibilityLabel,
    'aria-checked': props['aria-checked'],
    'aria-controls': props['aria-controls'],
    'aria-expanded': props['aria-expanded'],
    'aria-labelledby': props['aria-labelledby'],
    'aria-selected': props['aria-selected'],
    'aria-haspopup': props['aria-haspopup'],
    'aria-hidden': props['aria-hidden'],
    className: props.className,
    hidden: props.hidden,
    id: props.id,
    disabled: props.disabled,
    name: props.name,
    value: props.value,
    required: props.required,
    role: props.role,
    style: props.style,
    tabIndex: props.tabIndex,
    'data-menu-state': props['data-menu-state'],
    'data-menu-depth': props['data-menu-depth'],
    'data-menu-item-id': props['data-menu-item-id'],
    'data-menu-item-key': props['data-menu-item-key'],
    'data-menu-item-type': props['data-menu-item-type'],
    'data-system-type': props['data-system-type'],
    'data-theme': props['data-theme'],
    'data-scroll-area-content': props['data-scroll-area-content'],
  };
}

function isInteractive(props: BaseProps): boolean {
  return (
    props.onClick !== undefined ||
    props.onDoubleClick !== undefined ||
    props.onMouseEnter !== undefined ||
    props.onContextMenu !== undefined ||
    props.onScroll !== undefined
  );
}

export const View = React.forwardRef<HTMLElement, BaseProps>(function View(props, ref) {
  const interactive = isInteractive(props);
  let Element: 'div' | 'select' | 'option' = 'div';

  if (props.role === 'combobox') {
    Element = 'select';
  } else if (props.role === 'option') {
    Element = 'option';
  }

  return (
    <Element
      ref={ref as React.Ref<HTMLDivElement>}
      {...toTestProps(props)}
      role={props.role ?? (interactive ? 'button' : undefined)}
      tabIndex={props.tabIndex ?? (interactive ? 0 : undefined)}
      onChange={props.onChange}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
      onMouseEnter={props.onMouseEnter}
      onKeyDown={props.onKeyDown ?? (interactive ? () => undefined : undefined)}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
      onContextMenu={props.onContextMenu}
      onScroll={props.onScroll}
    >
      {props.children}
    </Element>
  );
});

export const Text = React.forwardRef<HTMLElement, BaseProps>(function Text(props, ref) {
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} {...toTestProps(props)}>
      {props.children}
    </span>
  );
});

export const Pressable = React.forwardRef<HTMLElement, PressableProps>(
  function Pressable(props, ref) {
    const renderAsButton =
      props.type !== undefined || props.role === 'checkbox' || props.role === 'radio';

    if (!renderAsButton) {
      const Element = 'div';
      const interactive = true;

      return (
        <Element
          ref={ref as React.Ref<HTMLDivElement>}
          {...toTestProps(props)}
          role={props.role ?? 'button'}
          tabIndex={props.tabIndex ?? (interactive ? 0 : undefined)}
          onMouseDown={props.onPressIn}
          onMouseUp={props.onPressOut}
          onChange={props.onChange}
          onClick={(event) => {
            props.onClick?.(event);
            props.onPress?.();
          }}
          onDoubleClick={props.onDoubleClick}
          onMouseEnter={props.onMouseEnter}
          onContextMenu={props.onContextMenu}
          onKeyDown={props.onKeyDown ?? (interactive ? () => undefined : undefined)}
          onPointerEnter={props.onPointerEnter}
          onPointerLeave={props.onPointerLeave}
        >
          {props.children}
        </Element>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type ?? 'button'}
        {...toTestProps(props)}
        disabled={props.disabled}
        onMouseDown={props.onPressIn}
        onMouseUp={props.onPressOut}
        onChange={props.onChange}
        onClick={(event) => {
          props.onClick?.(event);
          props.onPress?.();
        }}
        onDoubleClick={props.onDoubleClick}
        onMouseEnter={props.onMouseEnter}
        onKeyDown={props.onKeyDown}
        onPointerEnter={props.onPointerEnter}
        onPointerLeave={props.onPointerLeave}
        onContextMenu={props.onContextMenu}
      >
        {props.children}
      </button>
    );
  },
);

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
