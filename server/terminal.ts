import { spawn } from "node:child_process";
import type { PaseoApi } from "@getpaseo/client";

export async function openTerminal(paseo: PaseoApi, workspaceId: string): Promise<{ directory: string }> {
  const workspace = await paseo.workspaces.ref(workspaceId).refresh();
  if (!workspace) throw new Error(`Workspace not found: ${workspaceId}`);
  const directory = workspace.workspaceDirectory ?? workspace.projectRootPath;
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
