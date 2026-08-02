declare module 'bootstrap' {
  export class Modal {
    constructor(element: HTMLElement, options?: Partial<ModalOptions>);
    static getInstance(element: HTMLElement): Modal | null;
    static getOrCreateInstance(element: HTMLElement, config?: Partial<ModalOptions>): Modal;
    show(): void;
    hide(): void;
    toggle(): void;
    handleUpdate(): void;
    dispose(): void;
  }

  export interface ModalOptions {
    backdrop: boolean | 'static';
    keyboard: boolean;
    focus: boolean;
  }

  export class Offcanvas {
    constructor(element: HTMLElement, options?: Partial<OffcanvasOptions>);
    static getInstance(element: HTMLElement): Offcanvas | null;
    static getOrCreateInstance(element: HTMLElement, config?: Partial<OffcanvasOptions>): Offcanvas;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }

  export interface OffcanvasOptions {
    backdrop: boolean | 'static';
    keyboard: boolean;
    scroll: boolean;
  }

  export class Toast {
    constructor(element: HTMLElement, options?: Partial<ToastOptions>);
    static getInstance(element: HTMLElement): Toast | null;
    static getOrCreateInstance(element: HTMLElement, config?: Partial<ToastOptions>): Toast;
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export interface ToastOptions {
    animation: boolean;
    autohide: boolean;
    delay: number;
  }

  export class Collapse {
    constructor(element: HTMLElement, options?: Partial<CollapseOptions>);
    static getInstance(element: HTMLElement): Collapse | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }

  export interface CollapseOptions {
    parent: string | Element | null;
    toggle: boolean;
  }

  export class Dropdown {
    constructor(element: HTMLElement);
    static getInstance(element: HTMLElement): Dropdown | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }

  export class Tooltip {
    constructor(element: HTMLElement, options?: Partial<TooltipOptions>);
    static getInstance(element: HTMLElement): Tooltip | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    enable(): void;
    disable(): void;
    setContent(content: { '.tooltip-inner': string }): void;
  }

  export interface TooltipOptions {
    animation: boolean;
    container: string | Element | false;
    delay: number | { show: number; hide: number };
    html: boolean;
    placement: 'auto' | 'top' | 'bottom' | 'left' | 'right';
    title: string | Element | Function;
    trigger: string;
  }

  export class Popover {
    constructor(element: HTMLElement, options?: Partial<PopoverOptions>);
    static getInstance(element: HTMLElement): Popover | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }

  export interface PopoverOptions {
    animation: boolean;
    container: string | Element | false;
    content: string | Element | Function;
    delay: number | { show: number; hide: number };
    html: boolean;
    placement: 'auto' | 'top' | 'bottom' | 'left' | 'right';
    title: string | Element | Function;
    trigger: string;
  }
}
