import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import type { PaseoApi } from "@getpaseo/client";
import { lineRange, locateRendered } from "../shared/locate";

export async function workspaceRoot(paseo: PaseoApi, workspaceId: string): Promise<string> {
  const workspace = await paseo.workspaces.ref(workspaceId).refresh();
  if (!workspace) throw new Error(`워크스페이스를 찾지 못했습니다: ${workspaceId}`);
  return path.resolve(workspace.workspaceDirectory ?? workspace.projectRootPath);
}

export async function pathInfo(
  paseo: PaseoApi,
  workspaceId: string,
  target: string,
  find?: { text: string; occurrence: number },
) {
  const root = await workspaceRoot(paseo, workspaceId);
  const absolute = path.resolve(root, target);
  const relative = path.relative(root, absolute).split(path.sep).join("/") || ".";
  let lines = null;
  if (find) {
    const text = await readFile(absolute, "utf8");
    const range = locateRendered(text, find.text, find.occurrence);
    if (range) lines = lineRange(text, range.from, range.to);
  }
  return { absolute, relative, lines };
}

/** Starts a file manager without waiting: Explorer exits with 1 even when it succeeds. */
function launch(command: string, args: string[], verbatim = false): void {
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsVerbatimArguments: verbatim });
  child.on("error", (error) => console.error(`Failed to start ${command}`, error));
  child.unref();
}

export async function reveal(paseo: PaseoApi, workspaceId: string, target?: string): Promise<{}> {
  const root = await workspaceRoot(paseo, workspaceId);
  const absolute = target ? path.resolve(root, target) : null;
  if (process.platform === "win32") {
    // Explorer parses `/select,"<path>"` itself, so Node must pass the argument unquoted.
    launch("explorer.exe", [absolute ? `/select,"${absolute}"` : `"${root}"`], true);
  } else if (process.platform === "darwin") {
    launch("open", absolute ? ["-R", absolute] : [root]);
  } else {
    launch("xdg-open", [absolute ? path.dirname(absolute) : root]);
  }
  return {};
}
