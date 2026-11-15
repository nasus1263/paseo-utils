import type { PluginClientContext } from "@getpaseo/plugin/client";
import { installOpenTerminalShortcut } from "./client/web";
import { openTerminalRpc } from "./shared/terminal";

export default function contribute(client: PluginClientContext) {
  return installOpenTerminalShortcut((workspaceId) => {
    client.rpc(openTerminalRpc, { workspaceId }).catch((error) => {
      console.error("[paseo-utils] Failed to open terminal", error);
    });
  });
}
