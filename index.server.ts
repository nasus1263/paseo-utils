import type { PluginServerContext } from "@getpaseo/plugin/server";
import { pathInfo, reveal } from "./server/paths";
import { openTerminal } from "./server/terminal";
import { pathInfoRpc, revealRpc } from "./shared/paths";
import { openTerminalRpc } from "./shared/terminal";

export default function contribute(server: PluginServerContext) {
  server.handle(openTerminalRpc, ({ workspaceId, path }, { paseo }) => openTerminal(paseo, workspaceId, path));
  server.handle(revealRpc, ({ workspaceId, path }, { paseo }) => reveal(paseo, workspaceId, path));
  server.handle(pathInfoRpc, ({ workspaceId, path, find }, { paseo }) => pathInfo(paseo, workspaceId, path, find));
  return () => {};
}
