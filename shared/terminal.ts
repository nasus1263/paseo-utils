import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

/**
 * Opens a terminal in the directory of file `path`, or in the workspace directory when `path` is
 * absent. `path` is absolute or relative to the workspace directory.
 */
export const openTerminalRpc = defineRpc({
  name: "terminal.open",
  input: z.object({ workspaceId: z.string(), path: z.string().optional() }),
  output: z.object({ directory: z.string() }),
});
