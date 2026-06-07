import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CModal } from '../Modal';
import { mergeClasses } from '../Theme/mergeClasses';
import './index.scss';

/* ── 类型定义 ──
 * CConfirm 是基于 CModal 的薄封装：
 * - open / onClose / title / width / height / theme / className / data-testid 透传给 CModal
 * - 自己负责渲染 body 内容（message）+ Cancel/OK 两个按钮
 * - 不重复实现 portal / ESC / focus 还原 / mask 等行为，全交给 CModal
 */
export interface CConfirmProps {
  readonly open: boolean;
  readonly onClose?: (result: boolean) => void;
  readonly title?: React.ReactNode;
  readonly message?: React.ReactNode;
  readonly children?: React.ReactNode;
  /** 默认 'OK' */
  readonly confirmText?: React.ReactNode;
  /** 默认 'Cancel' */
  readonly cancelText?: React.ReactNode;
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly theme?: string;
  readonly className?: string;
  readonly 'data-testid'?: string;
  /** 默认 360 */
  readonly width?: number;
  readonly height?: number;
}

const DEFAULT_WIDTH = 360;
const DEFAULT_CONFIRM_TEXT = 'OK';
const DEFAULT_CANCEL_TEXT = 'Cancel';

/* ── 子组件：操作按钮行 ── 拆分以满足 sonarjs 复杂度阈值，并隔离按钮区视觉布局。
 * 注意：CSS 类名 .cm-confirm__ok / .cm-confirm__cancel 是稳定契约（4 套主题 SCSS 直接选中），
 * 不随 prop 名 confirmText/onConfirm 重命名而改变。 */

interface ConfirmActionsProps {
  readonly confirmText: React.ReactNode;
  readonly cancelText: React.ReactNode;
  readonly onConfirmClick: () => void;
  readonly onCancelClick: () => void;
  readonly dataTestId?: string;
}

function ConfirmActions({
  confirmText,
  cancelText,
  onConfirmClick,
  onCancelClick,
  dataTestId,
}: ConfirmActionsProps): React.ReactElement {
  return (
    <div className="cm-confirm__actions">
      {/* 顺序：Cancel | OK（从左到右） */}
      <button
        type="button"
        className="cm-confirm__cancel"
        onClick={onCancelClick}
        data-testid={dataTestId ? `${dataTestId}__cancel` : undefined}
      >
        {cancelText}
      </button>
      <button
        type="button"
        className="cm-confirm__ok"
        onClick={onConfirmClick}
        data-testid={dataTestId ? `${dataTestId}__ok` : undefined}
      >
        {confirmText}
      </button>
    </div>
  );
}

/* ── 主组件 ── */

export function CConfirm(props: CConfirmProps): React.ReactElement {
  const {
    open,
    onClose,
    title,
    message,
    children,
    confirmText = DEFAULT_CONFIRM_TEXT,
    cancelText = DEFAULT_CANCEL_TEXT,
    onConfirm,
    onCancel,
    theme,
    className,
    'data-testid': dataTestId,
    width = DEFAULT_WIDTH,
    height,
  } = props;

  /* Confirm 路径：先回调 onConfirm，再回调 onClose(true)（顺序按 spec 要求）。
   * onClose 的 boolean 参数：true = 用户点 OK；false = Cancel / ESC / mask / × */
  const handleConfirmClick = React.useCallback((): void => {
    onConfirm?.();
    onClose?.(true);
  }, [onConfirm, onClose]);

  /* Cancel 路径：先回调 onCancel，再回调 onClose(false)。
   * 这条路径同时被「点击 Cancel 按钮」「点击 mask」「按 ESC」「点击 CModal 标题栏 × 关闭按钮」复用，
   * 通过传给 CModal 的 onClose 实现 — CModal 触发 onClose 即视为「取消」。 */
  const handleCancel = React.useCallback((): void => {
    onCancel?.();
    onClose?.(false);
  }, [onCancel, onClose]);

  /* className 合并：cm-confirm + 外部自定义。
   * 不在此处合并 theme — CModal 自己会通过 useTheme 处理 theme，
   * 这里只把字符串透传，避免双重 normalize。 */
  const rootClassName = mergeClasses(['cm-confirm'], undefined, className);

  /* body 内容优先级：children ?? message（spec 要求 children 优先） */
  const bodyContent = children !== undefined ? children : message;

  return (
    <CModal
      open={open}
      onClose={handleCancel}
      title={title}
      width={width}
      height={height}
      theme={theme}
      className={rootClassName}
      data-testid={dataTestId}
    >
      <div
        className="cm-confirm__body"
        data-testid={dataTestId ? `${dataTestId}__body` : undefined}
      >
        {bodyContent}
      </div>
      <ConfirmActions
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirmClick={handleConfirmClick}
        onCancelClick={handleCancel}
        dataTestId={dataTestId}
      />
    </CModal>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 命令式 API：confirm(options): Promise<boolean>
 *
 * 设计要点：
 * - 每次调用创建独立的容器 div + React 18 root，绝不复用单例
 * - OK → resolve(true)，Cancel/ESC/mask/× → resolve(false)
 * - cleanup：root.unmount() 后 container.remove()，两者都执行
 * - resolve 只能触发一次（用 settled 标记防御）
 * - SSR 守卫：typeof document === 'undefined' 时直接 resolve(false)
 * ────────────────────────────────────────────────────────────────────── */

/* ConfirmOptions 派生自 CConfirmProps，去掉受控/回调相关字段，并显式新增 content 别名。
 * content 与 children 都用作 body 主体；优先级 children ?? content ?? message（imperative 内归一化为 children）。 */
export type ConfirmOptions = Omit<
  CConfirmProps,
  'open' | 'onClose' | 'onConfirm' | 'onCancel' | 'children'
> & {
  readonly content?: React.ReactNode;
  readonly children?: React.ReactNode;
};

/* 内部受控壳：把 confirm() 的 open 状态托管在自己的 state 里，
 * 这样我们可以在 resolve 之前先把 open 置为 false，触发 CModal 的卸载副作用
 * （焦点恢复、ESC 栈出栈、portal 容器移除等），随后再 unmount 整个 root。 */
interface ImperativeConfirmHostProps {
  readonly options: ConfirmOptions;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly onClose: (result: boolean) => void;
}

function ImperativeConfirmHost({
  options,
  onConfirm,
  onCancel,
  onClose,
}: ImperativeConfirmHostProps): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(true);

  const handleConfirm = React.useCallback((): void => {
    setOpen(false);
    onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback((): void => {
    setOpen(false);
    onCancel();
  }, [onCancel]);

  const handleClose = React.useCallback(
    (result: boolean): void => {
      setOpen(false);
      onClose(result);
    },
    [onClose],
  );

  /* 把 content 归一为 children 透传给 CConfirm（body 内部按 children ?? message 渲染）。 */
  const { content, children, ...rest } = options;
  const bodyChildren = children !== undefined ? children : content;

  return (
    <CConfirm
      {...rest}
      open={open}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      onClose={handleClose}
    >
      {bodyChildren}
    </CConfirm>
  );
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  /* SSR 守卫：服务端环境直接返回 false，不抛异常。 */
  if (typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    /* 每次调用：独立容器 + 独立 React root（不复用单例） */
    const container: HTMLDivElement = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    /* settled 标记：防止 OK 与 Cancel 同时触发 / 卸载时多次 resolve */
    let settled = false;

    /* cleanup：先 unmount 让 CModal 的清理副作用执行（ESC 栈出栈、portal 容器移除等），
     * 再把命令式容器从 body 移除。延迟 unmount 到微任务以避开「unmount in render/effect」警告。 */
    function cleanup(): void {
      /* setTimeout 0 让当前调用栈完成后再卸载，避免 React 在事件回调内 unmount 自身警告 */
      setTimeout((): void => {
        root.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 0);
    }

    function settle(value: boolean): void {
      if (settled) return;
      settled = true;
      resolve(value);
    }

    function handleConfirm(): void {
      settle(true);
    }

    function handleCancel(): void {
      settle(false);
    }

    /* CConfirm 的 onClose 携带 boolean 结果。我们用该值 settle Promise，
     * 然后 cleanup。settle 内部去重保证只 resolve 一次。 */
    function handleClose(result: boolean): void {
      settle(result);
      cleanup();
    }

    root.render(
      <ImperativeConfirmHost
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={handleClose}
      />,
    );
  });
}
