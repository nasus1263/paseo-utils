import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

/**
 * Shows `path` selected in the system file manager, or opens the workspace directory when `path`
 * is absent. `path` is absolute or relative to the workspace directory.
 */
export const revealRpc = defineRpc({
  name: "paths.reveal",
  input: z.object({ workspaceId: z.string(), path: z.string().optional() }),
  output: z.object({}),
});

/**
 * Resolves `path` against the workspace directory. With `find`, also locates rendered text in the
 * file and returns its lines.
 */
export const pathInfoRpc = defineRpc({
  name: "paths.info",
  input: z.object({
    workspaceId: z.string(),
    path: z.string(),
    find: z.object({ text: z.string(), occurrence: z.number().int().min(0) }).optional(),
  }),
  output: z.object({
    absolute: z.string(),
    relative: z.string(),
    lines: z.object({ start: z.number(), end: z.number() }).nullable(),
  }),
});
