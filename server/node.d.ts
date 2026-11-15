// The plugin typechecks without @types/node; declare only the Node APIs the server uses.
declare module "node:child_process" {
  interface ChildProcess {
    on(event: "error", listener: (error: Error) => void): this;
    unref(): void;
  }
  export function spawn(
    command: string,
    args: readonly string[],
    options: { detached: boolean; stdio: "ignore" },
  ): ChildProcess;
}

declare const process: { platform: string };
