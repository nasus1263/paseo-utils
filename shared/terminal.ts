import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const openTerminalRpc = defineRpc({
  name: "terminal.open",
  input: z.object({ workspaceId: z.string() }),
  output: z.object({ directory: z.string() }),
});
