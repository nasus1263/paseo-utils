import { Platform } from "react-native";
import { countOccurrences, type LineRange, plain } from "../shared/locate";

// This plugin typechecks without the DOM library. Declare only what this module uses.
interface DomKeyEvent {
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  target: unknown;
  preventDefault(): void;
  stopPropagation(): void;
}
type DomKeyListener = (event: DomKeyEvent) => void;
type DomPointerListener = (event: { target: unknown }) => void;
interface DomNode {
  nodeType: number;
  parentNode: DomNode | null;
  parentElement: DomElement | null;
}
interface DomElement extends DomNode {
  textContent: string | null;
  scrollHeight: number;
  clientHeight: number;
  style: Record<string, string>;
  getAttribute(name: string): string | null;
  getBoundingClientRect(): { width: number; height: number };
  closest(selector: string): DomElement | null;
  querySelector(selector: string): DomElement | null;
  appendChild(child: unknown): void;
  remove(): void;
}
interface DomRange {
  collapsed: boolean;
  startContainer: DomNode;
  startOffset: number;
  toString(): string;
  setStart(node: DomNode, offset: number): void;
  setEnd(node: DomNode, offset: number): void;
}
interface DomSelection {
  isCollapsed: boolean;
  rangeCount: number;
  getRangeAt(index: number): DomRange;
}
declare const window: {
  location: { pathname: string; hash: string };
  addEventListener(type: "keydown", listener: DomKeyListener, capture: boolean): void;
  removeEventListener(type: "keydown", listener: DomKeyListener, capture: boolean): void;
  getComputedStyle(element: DomElement): { overflowY: string };
  setTimeout(handler: () => void, ms: number): unknown;
};
declare const document: {
  activeElement: DomElement | null;
  body: DomElement;
  getSelection(): DomSelection | null;
  createRange(): DomRange;
  createElement(tag: string): DomElement;
  querySelectorAll(selector: string): ArrayLike<DomElement>;
  addEventListener(type: "pointerdown", listener: DomPointerListener, capture: boolean): void;
  removeEventListener(type: "pointerdown", listener: DomPointerListener, capture: boolean): void;
};
declare const CSS: { highlights?: { get(name: string): Iterable<DomRange> | undefined } } | undefined;
declare function atob(data: string): string;
declare class TextDecoder {
  decode(input: Uint8Array): string;
}

const WORKSPACE_ROUTE = /\/h\/[^/?#]+\/workspace\/([^/?#]+)/;
const BASE64_PREFIX = "b64_";

/** Mirrors Paseo's route encoding: plain ids as-is, others as `b64_` + base64url(utf8). */
function decodeWorkspaceSegment(segment: string): string {
  const raw = decodeURIComponent(segment);
  if (!raw.startsWith(BASE64_PREFIX)) return raw;
  const base64 = raw.slice(BASE64_PREFIX.length).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** The workspace open in the app's current route, or null outside a workspace. */
function currentWorkspaceId(): string | null {
  const { pathname, hash } = window.location;
  const match = WORKSPACE_ROUTE.exec(pathname) ?? WORKSPACE_ROUTE.exec(hash);
  return match ? decodeWorkspaceSegment(match[1]) : null;
}

function isInTerminal(target: unknown): boolean {
  const element = target as { closest?(selector: string): unknown } | null;
  return Boolean(element?.closest?.(".xterm"));
}

/** Calls `onOpen` with the current workspace on Ctrl+Shift+C. Web only; a no-op elsewhere. */
export function installOpenTerminalShortcut(onOpen: (workspaceId: string) => void): () => void {
  if (Platform.OS !== "web") return () => {};
  const listener: DomKeyListener = (event) => {
    if (event.code !== "KeyC" || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) return;
    // Paseo's own terminals use Ctrl+Shift+C to copy.
    if (isInTerminal(event.target)) return;
    const workspaceId = currentWorkspaceId();
    if (!workspaceId) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) onOpen(workspaceId);
  };
  window.addEventListener("keydown", listener, true);
  return () => window.removeEventListener("keydown", listener, true);
}

/** The tab the user works in: the workspace and, for a file tab, the file's path. */
export interface ActiveTab {
  workspaceId: string;
  filePath: string | null;
}

/** Lines selected in a source editor, or rendered text to find in the file. */
export type SelectionLines =
  | ({ kind: "lines" } & LineRange)
  | { kind: "text"; text: string; occurrence: number }
  | null;

/** A CodeMirror view, reached through the tile CodeMirror keeps on its content element. */
interface CodeMirrorView {
  state: {
    selection: { main: { from: number; to: number; empty: boolean } };
    doc: { lineAt(pos: number): { number: number; from: number } };
  };
}

const TAB_PREFIX = "workspace-tab-";
/** The range paseo-doc-ask keeps highlighted while its input box holds the focus. */
const DOC_ASK_HELD = "doc-ask-held-selection";

let lastPressed: DomNode | null = null;

/**
 * Calls `onReveal` on Shift+Alt+R and `onCopy` on Alt+L (`absolute` with Ctrl+Alt+L) with the
 * active tab, in a workspace only. Matches physical keys, so the Korean input mode does not
 * matter. Web only; a no-op elsewhere.
 */
export function installPathShortcuts(
  onReveal: (tab: ActiveTab) => void,
  onCopy: (tab: ActiveTab, absolute: boolean) => void,
): () => void {
  if (Platform.OS !== "web") return () => {};
  const press: DomPointerListener = (event) => {
    lastPressed = (event.target as DomNode | null) ?? null;
  };
  const listener: DomKeyListener = (event) => {
    if (!event.altKey || event.metaKey) return;
    const reveal = event.code === "KeyR" && event.shiftKey && !event.ctrlKey;
    const copy = event.code === "KeyL" && !event.shiftKey;
    if (!reveal && !copy) return;
    const workspaceId = currentWorkspaceId();
    if (!workspaceId) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;
    const tab = { workspaceId, filePath: activeFilePath() };
    if (reveal) onReveal(tab);
    else onCopy(tab, event.ctrlKey);
  };
  document.addEventListener("pointerdown", press, true);
  window.addEventListener("keydown", listener, true);
  return () => {
    document.removeEventListener("pointerdown", press, true);
    window.removeEventListener("keydown", listener, true);
    lastPressed = null;
  };
}

function ancestors(node: DomNode | null): DomNode[] {
  const list: DomNode[] = [];
  for (let at = node; at; at = at.parentNode) list.push(at);
  return list;
}

/** How deep the closest common ancestor of `tab` and the `reference` chain lies. */
function sharedDepth(tab: DomElement, reference: Set<DomNode>): number {
  const chain = ancestors(tab);
  const common = chain.findIndex((node) => reference.has(node));
  return common === -1 ? -1 : chain.length - common;
}

function currentRange(): DomRange | null {
  const selection = document.getSelection();
  if (selection && !selection.isCollapsed && selection.rangeCount > 0) return selection.getRangeAt(0);
  const held = typeof CSS === "undefined" ? undefined : CSS.highlights?.get(DOC_ASK_HELD);
  if (held) for (const range of held) if (!range.collapsed) return range;
  return null;
}

/**
 * The path of the selected tab when it is a file tab. With split panes, the pane is the one that
 * shares the deepest ancestor with the selection, the last press, or the focus.
 */
function activeFilePath(): string | null {
  const tabs = Array.from(
    document.querySelectorAll(`[data-testid^="${TAB_PREFIX}"][aria-selected="true"]`),
  ).filter((tab) => {
    const rect = tab.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (tabs.length === 0) return null;
  const reference = new Set(ancestors(currentRange()?.startContainer ?? lastPressed ?? document.activeElement));
  let best = tabs[0];
  let bestDepth = sharedDepth(best, reference);
  for (const tab of tabs.slice(1)) {
    const depth = sharedDepth(tab, reference);
    if (depth > bestDepth) [best, bestDepth] = [tab, depth];
  }
  // Paseo names a file tab `workspace-tab-file_<path>`.
  const id = (best.getAttribute("data-testid") ?? "").slice(TAB_PREFIX.length);
  return id.startsWith("file_") ? id.slice("file_".length) : null;
}

function elementOf(node: DomNode): DomElement | null {
  return node.nodeType === 1 ? (node as DomElement) : node.parentElement;
}

function codeMirrorView(editor: DomElement): CodeMirrorView | null {
  const content = editor.querySelector(".cm-content") as
    | (DomElement & {
        cmTile?: { root?: { view?: CodeMirrorView } };
        cmView?: { rootView?: { view?: CodeMirrorView } };
      })
    | null;
  return content?.cmTile?.root?.view ?? content?.cmView?.rootView?.view ?? null;
}

/** The nearest ancestor that scrolls, which holds a rendered document from its start. */
function scrollRoot(element: DomElement): DomElement {
  for (let at: DomElement | null = element; at; at = at.parentElement) {
    const overflow = window.getComputedStyle(at).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && at.scrollHeight > at.clientHeight) return at;
  }
  return document.body;
}

/** What is selected: lines of a source editor, or rendered text with how often it occurs before. */
export function selectionLines(): SelectionLines {
  if (Platform.OS !== "web") return null;
  const range = currentRange();
  const element = range && elementOf(range.startContainer);
  if (!range || !element) return null;
  const editor = element.closest(".cm-editor");
  const view = editor && codeMirrorView(editor);
  if (view) {
    const { from, to, empty } = view.state.selection.main;
    if (empty) return null;
    const start = view.state.doc.lineAt(from).number;
    const last = view.state.doc.lineAt(to);
    const end = last.from === to && to > from ? last.number - 1 : last.number;
    return { kind: "lines", start, end: Math.max(start, end) };
  }
  const text = range.toString();
  const needle = plain(text);
  if (needle === "") return null;
  const before = document.createRange();
  before.setStart(scrollRoot(element), 0);
  before.setEnd(range.startContainer, range.startOffset);
  return { kind: "text", text, occurrence: countOccurrences(plain(before.toString()), needle) };
}

/** A short message at the bottom of the window. Web only. */
export function showToast(message: string, error = false): void {
  if (Platform.OS !== "web") return;
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    left: "50%",
    bottom: "32px",
    transform: "translateX(-50%)",
    maxWidth: "80vw",
    padding: "8px 14px",
    borderRadius: "8px",
    background: error ? "rgba(160, 40, 40, 0.92)" : "rgba(30, 30, 30, 0.92)",
    color: "#fff",
    font: "13px system-ui, sans-serif",
    wordBreak: "break-all",
    zIndex: "2147483647",
    pointerEvents: "none",
  });
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2200);
}
