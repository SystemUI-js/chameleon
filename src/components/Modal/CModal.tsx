import React from 'react';
import { createPortal } from 'react-dom';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import { CWindow } from '../Window/Window';
import './index.scss';

export interface CModalProps {
  readonly open: boolean;
  readonly onClose?: () => void;
  readonly title?: React.ReactNode;
  readonly children?: React.ReactNode;
  /**
   * 默认 420。
   * 接受 number（像素值，传递给 CWindow）或 string（如 "80%"、"400px"，通过内联样式应用）。
   */
  readonly width?: number | string;
  /**
   * 可选，未提供则由内容自适应。
   * 接受 number（像素值，传递给 CWindow）或 string（如 "60vh"、"300px"，通过内联样式应用）。
   */
  readonly height?: number | string;
  /** 默认 true */
  readonly closeOnEsc?: boolean;
  /** 默认 true */
  readonly closeOnMaskClick?: boolean;
  /** 默认 true */
  readonly showCloseButton?: boolean;
  readonly theme?: string;
  readonly className?: string;
  readonly maskClassName?: string;
  readonly contentClassName?: string;
  readonly 'aria-label'?: string;
  readonly 'data-testid'?: string;
}

const DEFAULT_WIDTH = 420;

/* ── 模块级 ESC 栈：仅栈顶的 modal 响应 ESC ──
 * 每一项是一个稳定的回调引用，模态打开时 push，卸载/关闭时 pop。 */
type EscHandler = () => void;
const escStack: EscHandler[] = [];
let escListenerInstalled = false;

/** 文档级 keydown 监听：只触发栈顶 modal 的回调。 */
function handleDocumentKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  if (escStack.length === 0) return;
  const top = escStack[escStack.length - 1];
  top();
}

function ensureEscListener(): void {
  if (escListenerInstalled) return;
  if (typeof document === 'undefined') return;
  document.addEventListener('keydown', handleDocumentKeyDown);
  escListenerInstalled = true;
}

function teardownEscListenerIfEmpty(): void {
  if (escStack.length > 0) return;
  if (!escListenerInstalled) return;
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', handleDocumentKeyDown);
  escListenerInstalled = false;
}

function pushEsc(handler: EscHandler): void {
  escStack.push(handler);
  ensureEscListener();
}

function popEsc(handler: EscHandler): void {
  const idx = escStack.lastIndexOf(handler);
  if (idx >= 0) {
    escStack.splice(idx, 1);
  }
  teardownEscListenerIfEmpty();
}

/* ── 焦点恢复：捕获打开时的 activeElement，关闭/卸载时还原。 ── */

function isFocusable(el: Element | null): el is HTMLElement {
  return el instanceof HTMLElement && typeof el.focus === 'function';
}

/* ── 子组件：标题栏（不是 CWindowTitle，因此不会启用拖拽）。 ── */

interface ModalTitleBarProps {
  readonly title?: React.ReactNode;
  readonly showCloseButton: boolean;
  readonly onClose?: () => void;
  readonly dataTestId?: string;
}

function ModalTitleBar({
  title,
  showCloseButton,
  onClose,
  dataTestId,
}: ModalTitleBarProps): React.ReactElement {
  return (
    <div className="cm-window__title-bar">
      <span
        className="cm-modal__title"
        data-testid={dataTestId ? `${dataTestId}__title` : undefined}
      >
        {title}
      </span>
      {showCloseButton ? (
        <button
          type="button"
          className="cm-modal__close-button"
          aria-label="Close"
          onClick={onClose}
          data-testid={dataTestId ? `${dataTestId}__close` : undefined}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

/* ── 子组件：模态主体（包含 CWindow 视觉外壳）。 ── */

interface ModalBodyProps {
  readonly width: number | string;
  readonly height?: number | string;
  readonly theme?: string;
  readonly title?: React.ReactNode;
  readonly showCloseButton: boolean;
  readonly onClose?: () => void;
  readonly contentClassName?: string;
  readonly maskClassName?: string;
  readonly closeOnMaskClick: boolean;
  readonly dataTestId?: string;
  readonly children?: React.ReactNode;
}

/* ── 焦点陷阱（Focus Trap）的可聚焦元素选择器 ──
 * 覆盖原生交互元素 + tabindex 显式指定的元素，排除 tabindex="-1"。
 * 注意：mask 自身 tabIndex=-1，因此天然被排除在 trap 外。 */
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 在给定根节点内收集所有可聚焦元素。
 * 仅过滤 aria-hidden="true" 与 hidden 属性的元素；不使用 offsetParent 检查，
 * 因为 jsdom 不计算布局，offsetParent 永远为 null，会误判所有元素不可见。
 */
function collectFocusable(root: HTMLElement): readonly HTMLElement[] {
  const candidates = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const visible: HTMLElement[] = [];
  candidates.forEach((el) => {
    if (el.hasAttribute('hidden')) return;
    if (el.getAttribute('aria-hidden') === 'true') return;
    visible.push(el);
  });
  return visible;
}

function ModalBody({
  width,
  height,
  theme,
  title,
  showCloseButton,
  onClose,
  contentClassName,
  maskClassName,
  closeOnMaskClick,
  dataTestId,
  children,
}: ModalBodyProps): React.ReactElement {
  /* 仅当点击事件目标为遮罩本身（非冒泡自子节点）才触发关闭。
   * 使用 <button> 元素以满足 a11y 规则；mask 不参与 tab 顺序。 */
  const handleMaskClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (!closeOnMaskClick) return;
      if (event.target !== event.currentTarget) return;
      onClose?.();
    },
    [closeOnMaskClick, onClose],
  );

  /* 当 width/height 为字符串（如 "80%"、"400px"）时，
   * CWindow 只接受 number，所以传默认数值给 CWindow，
   * 并把用户的字符串值通过内联样式应用到 .cm-modal__window-host 上以覆盖尺寸。 */
  const cWindowWidth = typeof width === 'number' ? width : DEFAULT_WIDTH;
  const cWindowHeight = typeof height === 'number' ? (height ?? 0) : 0;

  const hostStyle: React.CSSProperties | undefined =
    typeof width === 'string' || typeof height === 'string'
      ? {
          ...(typeof width === 'string' ? { width } : undefined),
          ...(typeof height === 'string' ? { height } : undefined),
        }
      : undefined;

  /* ── 焦点陷阱（Focus Trap） ──
   * 1. 自动聚焦：modal 打开（ModalBody 挂载）时，将焦点移到 window-host 内
   *    第一个可聚焦元素（通常是关闭按钮，因为它在标题栏靠前位置）。
   * 2. Tab 循环：监听 document 的 keydown，当焦点在最后一个可聚焦元素上按 Tab，
   *    跳回第一个；在第一个元素上按 Shift+Tab，跳到最后一个。
   * 3. 动态内容：每次 Tab 时重新查询可聚焦元素，避免缓存过时（用户内容可能动态变化）。
   * 4. 卸载清理：移除 document 监听器，避免内存泄漏。
   * 注意：本 effect 仅在 ModalBody 挂载/卸载时运行一次，由外层 CModal 的 open 切换
   *      会卸载/重建 ModalBody，所以无需在依赖里追踪 open。 */
  const windowHostRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const host = windowHostRef.current;
    if (!host) return undefined;

    /* 自动聚焦：挂载后将焦点放到第一个可聚焦元素。 */
    const initial = collectFocusable(host);
    if (initial.length > 0) {
      initial[0].focus();
    }

    /* Tab 循环监听器：使用 document 级别监听确保即便焦点已意外逃逸也能拦截。
     * 仅当 Tab 键且按下时焦点在 host 内（或没有有效焦点）时才介入循环。 */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;

      const focusable = collectFocusable(host);
      if (focusable.length === 0) {
        /* 没有可聚焦元素：阻止焦点离开 modal（避免 Tab 跳到背景元素）。 */
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      /* 若当前焦点不在 modal 内（例如焦点意外丢到 body），把焦点拉回第一个。 */
      if (!(active instanceof HTMLElement) || !host.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Close modal mask"
        tabIndex={-1}
        className={mergeClasses(['cm-modal__mask'], undefined, maskClassName)}
        onClick={handleMaskClick}
        data-testid={dataTestId ? `${dataTestId}__mask` : undefined}
      />
      <div
        className={mergeClasses(['cm-modal__content'], undefined, contentClassName)}
        data-testid={dataTestId ? `${dataTestId}__content` : undefined}
      >
        <div className="cm-modal__window-host" style={hostStyle} ref={windowHostRef}>
          {/* CWindow 是 class 组件，按 number 传 width/height；
              不使用 CWindowTitle 以保持非拖拽。 */}
          <CWindow
            x={0}
            y={0}
            width={cWindowWidth}
            height={cWindowHeight}
            theme={theme}
            resizable={false}
          >
            <ModalTitleBar
              title={title}
              showCloseButton={showCloseButton}
              onClose={onClose}
              dataTestId={dataTestId}
            />
            {children}
          </CWindow>
        </div>
      </div>
    </>
  );
}

/* ── 主组件 ── */

export function CModal(props: CModalProps): React.ReactElement | null {
  const {
    open,
    onClose,
    title,
    children,
    width = DEFAULT_WIDTH,
    height,
    closeOnEsc = true,
    closeOnMaskClick = true,
    showCloseButton = true,
    theme,
    className,
    maskClassName,
    contentClassName,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  } = props;

  const resolvedTheme = normalizeThemeClassName(useTheme(theme));

  /* SSR 守卫：服务端渲染时直接返回 null，不创建 portal、不访问 document。 */
  const isBrowser = typeof document !== 'undefined';

  /* portal 容器作为 state：useEffect 创建后 setState 触发重渲染挂载内容。 */
  const [portalContainer, setPortalContainer] = React.useState<HTMLDivElement | null>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  /* 用 useRef 持有最新的 onClose / closeOnEsc，避免 ESC handler 闭包陷阱。 */
  const onCloseRef = React.useRef<typeof onClose>(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeOnEscRef = React.useRef<boolean>(closeOnEsc);
  React.useEffect(() => {
    closeOnEscRef.current = closeOnEsc;
  }, [closeOnEsc]);

  React.useEffect(() => {
    if (!isBrowser) return undefined;
    if (!open) return undefined;

    /* 1. 创建 portal 容器并挂载到 body。容器本身就是 .cm-modal 根节点，
     *    避免外层多余的包装 div（保证 root.parentElement === document.body）。 */
    const container = document.createElement('div');
    document.body.appendChild(container);

    /* 2. 记录前一个焦点 */
    previouslyFocusedRef.current = isFocusable(document.activeElement)
      ? document.activeElement
      : null;

    /* 3. 注册到 ESC 栈：仅栈顶 modal 响应 ESC */
    const escHandler: EscHandler = () => {
      if (!closeOnEscRef.current) return;
      onCloseRef.current?.();
    };
    pushEsc(escHandler);

    /* 4. 触发重渲染挂载内容 */
    setPortalContainer(container);

    return () => {
      popEsc(escHandler);

      const prev = previouslyFocusedRef.current;
      if (prev && document.body.contains(prev)) {
        prev.focus();
      }
      previouslyFocusedRef.current = null;

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }

      setPortalContainer(null);
    };
  }, [isBrowser, open]);

  if (!isBrowser) return null;
  if (!open) return null;
  if (!portalContainer) return null;

  const rootClassName = mergeClasses(['cm-modal', 'cm-modal--open'], resolvedTheme, className);

  return (
    <>
      <ContainerAttrsSync
        container={portalContainer}
        className={rootClassName}
        ariaLabel={ariaLabel}
        dataTestId={dataTestId}
      />
      {createPortal(
        <ModalBody
          width={width}
          height={height}
          theme={theme}
          title={title}
          showCloseButton={showCloseButton}
          onClose={onClose}
          contentClassName={contentClassName}
          maskClassName={maskClassName}
          closeOnMaskClick={closeOnMaskClick}
          dataTestId={dataTestId}
        >
          {children}
        </ModalBody>,
        portalContainer,
      )}
    </>
  );
}

/* ── 子组件：把外部属性同步到 portal 容器 DOM 节点上。
 * 因为容器本身就是 .cm-modal 根，React 无法直接渲染到“已存在的元素属性”，
 * 所以用 useLayoutEffect 在每次渲染后做属性同步。 ── */
interface ContainerAttrsSyncProps {
  readonly container: HTMLElement;
  readonly className: string;
  readonly ariaLabel?: string;
  readonly dataTestId?: string;
}

function ContainerAttrsSync({
  container,
  className,
  ariaLabel,
  dataTestId,
}: ContainerAttrsSyncProps): null {
  React.useLayoutEffect(() => {
    container.className = className;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    if (ariaLabel !== undefined) {
      container.setAttribute('aria-label', ariaLabel);
    } else {
      container.removeAttribute('aria-label');
    }
    if (dataTestId !== undefined) {
      container.setAttribute('data-testid', dataTestId);
    } else {
      container.removeAttribute('data-testid');
    }
  }, [container, className, ariaLabel, dataTestId]);
  return null;
}
