import { spawn } from "node:child_process";
import * as path from "node:path";
import type { PaseoApi } from "@getpaseo/client";
import { workspaceRoot } from "./paths";

/** Opens Windows Terminal in the directory of file `target`, or in the workspace directory without one. */
export async function openTerminal(
  paseo: PaseoApi,
  workspaceId: string,
  target?: string,
): Promise<{ directory: string }> {
  const root = await workspaceRoot(paseo, workspaceId);
  const directory = target ? path.dirname(path.resolve(root, target)) : root;
  if (process.platform !== "win32") throw new Error(`Unsupported platform: ${process.platform}`);
  // A trailing backslash would escape the closing quote Windows adds around the argument.
  const child = spawn("wt.exe", ["-d", directory.replace(/[\/]+$/, "") || directory], {
    detached: true,
    stdio: "ignore",
  });
  child.on("error", (error) => console.error("Failed to start wt.exe", error));
  child.unref();
  return { directory };
}
