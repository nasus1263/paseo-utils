import type { PluginServerContext } from "@getpaseo/plugin/server";
import { openTerminal } from "./server/terminal";
import { openTerminalRpc } from "./shared/terminal";

export default function contribute(server: PluginServerContext) {
  server.handle(openTerminalRpc, ({ workspaceId }, { paseo }) => openTerminal(paseo, workspaceId));
  return () => {};
}
