// The plugin typechecks without @types/node; declare only the Node APIs the server uses.
declare module "node:child_process" {
  interface ChildProcess {
    on(event: "error", listener: (error: Error) => void): this;
    unref(): void;
  }
  export function spawn(
    command: string,
    args: readonly string[],
    options: { detached: boolean; stdio: "ignore"; windowsVerbatimArguments?: boolean },
  ): ChildProcess;
}

declare module "node:fs/promises" {
  export function readFile(path: string, encoding: "utf8"): Promise<string>;
}

declare module "node:path" {
  export const sep: string;
  export function resolve(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function dirname(path: string): string;
}

declare const process: { platform: string };
