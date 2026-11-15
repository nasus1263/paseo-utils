import type { PluginClientContext } from "@getpaseo/plugin/client";
import { copyText } from "@getpaseo/plugin/client/ui";
import { installOpenTerminalShortcut, installPathShortcuts, selectionLines, showToast } from "./client/web";
import { withLines } from "./shared/locate";
import { pathInfoRpc, revealRpc } from "./shared/paths";
import { openTerminalRpc } from "./shared/terminal";

function failed(error: unknown): void {
  console.error("[paseo-utils]", error);
  showToast(error instanceof Error ? error.message : String(error), true);
}

export default function contribute(client: PluginClientContext) {
  async function copyPath(workspaceId: string, filePath: string, absolute: boolean) {
    const selection = selectionLines();
    const info = await client.rpc(pathInfoRpc, {
      workspaceId,
      path: filePath,
      find: selection?.kind === "text" ? { text: selection.text, occurrence: selection.occurrence } : undefined,
    });
    const text = withLines(absolute ? info.absolute : info.relative, selection?.kind === "lines" ? selection : info.lines);
    await copyText(text);
    showToast(`복사됨: ${text}`);
  }

  const removals = [
    installOpenTerminalShortcut(({ workspaceId, filePath }) => {
      client.rpc(openTerminalRpc, { workspaceId, path: filePath ?? undefined }).catch((error) => {
        console.error("[paseo-utils] Failed to open terminal", error);
      });
    }),
    installPathShortcuts(
      ({ workspaceId, filePath }) => {
        client.rpc(revealRpc, { workspaceId, path: filePath ?? undefined }).catch(failed);
      },
      ({ workspaceId, filePath }, absolute) => {
        if (!filePath) return showToast("파일 탭이 아닙니다.", true);
        copyPath(workspaceId, filePath, absolute).catch(failed);
      },
    ),
  ];
  return () => {
    for (const remove of removals) remove();
  };
}
