import { Platform } from "react-native";

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
declare const window: {
  location: { pathname: string; hash: string };
  addEventListener(type: "keydown", listener: DomKeyListener, capture: boolean): void;
  removeEventListener(type: "keydown", listener: DomKeyListener, capture: boolean): void;
};
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
