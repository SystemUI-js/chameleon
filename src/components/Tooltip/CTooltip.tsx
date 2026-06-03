import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type CTooltipTrigger = 'hover' | 'focus' | 'click';

interface TooltipTriggerElementProps {
  onBlur?: React.FocusEventHandler<Element>;
  onClick?: React.MouseEventHandler<Element>;
  onFocus?: React.FocusEventHandler<Element>;
  onPointerEnter?: React.PointerEventHandler<Element>;
  onPointerLeave?: React.PointerEventHandler<Element>;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
}

export interface CTooltipProps {
  children: React.ReactElement<TooltipTriggerElementProps>;
  title: React.ReactNode;
  placement?: CTooltipPlacement;
  trigger?: CTooltipTrigger;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

function getDelayMs(delay: number): number {
  const safeDelay = Math.max(0, delay);

  return safeDelay <= 10 ? safeDelay * 1000 : safeDelay;
}

function clearTimer(timerRef: React.MutableRefObject<number | null>): void {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export function CTooltip({
  children,
  title,
  placement = 'top',
  trigger = 'hover',
  open,
  defaultOpen = false,
  disabled = false,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0,
  onOpenChange,
  className,
  theme,
  'data-testid': dataTestId,
}: CTooltipProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const tooltipId = React.useId().replace(/:/g, '');
  const tooltipContentId = `${tooltipId}-tooltip`;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const enterTimerRef = React.useRef<number | null>(null);
  const leaveTimerRef = React.useRef<number | null>(null);
  const isControlled = open !== undefined;
  const requestedOpen = isControlled ? open : uncontrolledOpen;
  const isVisible = !disabled && requestedOpen;
  const baseClasses = [
    'cm-tooltip',
    `cm-tooltip--${placement}`,
    isVisible ? 'cm-tooltip--open' : '',
    disabled ? 'cm-tooltip--disabled' : '',
  ];

  const clearTimers = React.useCallback((): void => {
    clearTimer(enterTimerRef);
    clearTimer(leaveTimerRef);
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  const updateOpen = (nextOpen: boolean): void => {
    if (disabled) {
      return;
    }

    if (nextOpen === requestedOpen) {
      return;
    }

    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const showTooltip = (): void => {
    updateOpen(true);
  };

  const hideTooltip = (): void => {
    updateOpen(false);
  };

  const scheduleShowTooltip = (): void => {
    clearTimer(leaveTimerRef);
    clearTimer(enterTimerRef);

    const delay = getDelayMs(mouseEnterDelay);

    if (delay === 0) {
      showTooltip();
      return;
    }

    enterTimerRef.current = window.setTimeout(showTooltip, delay);
  };

  const scheduleHideTooltip = (): void => {
    clearTimer(enterTimerRef);
    clearTimer(leaveTimerRef);

    const delay = getDelayMs(mouseLeaveDelay);

    if (delay === 0) {
      hideTooltip();
      return;
    }

    leaveTimerRef.current = window.setTimeout(hideTooltip, delay);
  };

  const handlePointerEnter: React.PointerEventHandler<Element> = (event) => {
    children.props.onPointerEnter?.(event);

    if (!event.defaultPrevented) {
      scheduleShowTooltip();
    }
  };

  const handlePointerLeave: React.PointerEventHandler<Element> = (event) => {
    children.props.onPointerLeave?.(event);

    if (!event.defaultPrevented) {
      scheduleHideTooltip();
    }
  };

  const handleFocus: React.FocusEventHandler<Element> = (event) => {
    children.props.onFocus?.(event);

    if (!event.defaultPrevented) {
      showTooltip();
    }
  };

  const handleBlur: React.FocusEventHandler<Element> = (event) => {
    children.props.onBlur?.(event);

    if (!event.defaultPrevented) {
      hideTooltip();
    }
  };

  const handleClick: React.MouseEventHandler<Element> = (event) => {
    children.props.onClick?.(event);

    if (!event.defaultPrevented) {
      updateOpen(!requestedOpen);
    }
  };

  const triggerProps: TooltipTriggerElementProps = {
    'aria-describedby': isVisible ? tooltipContentId : undefined,
  };

  if (trigger === 'hover') {
    triggerProps.onPointerEnter = handlePointerEnter;
    triggerProps.onPointerLeave = handlePointerLeave;
  }

  if (trigger === 'focus') {
    triggerProps.onFocus = handleFocus;
    triggerProps.onBlur = handleBlur;
  }

  if (trigger === 'click') {
    triggerProps.onClick = handleClick;
    triggerProps['aria-expanded'] = isVisible;
  }

  const triggerElement = React.cloneElement(children, triggerProps);

  return (
    <span
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      data-testid={dataTestId}
      data-tooltip-state={isVisible ? 'open' : 'closed'}
    >
      <span className="cm-tooltip__trigger">{triggerElement}</span>
      <span
        aria-hidden={!isVisible}
        className={mergeClasses([
          'cm-tooltip__popup',
          'cm-tooltip__overlay',
          `cm-tooltip__overlay--${placement}`,
          isVisible ? 'cm-tooltip__overlay--visible' : 'cm-tooltip__overlay--hidden',
        ])}
        id={tooltipContentId}
        role="tooltip"
      >
        <span className="cm-tooltip__arrow" />
        <span className="cm-tooltip__content">{title}</span>
      </span>
    </span>
  );
}
