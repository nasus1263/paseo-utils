Small conveniences for Paseo.

Press Ctrl+Shift+C while a workspace is open to launch Windows Terminal. On a file tab it starts in that file's directory; on any other tab it starts in the workspace's directory (the worktree directory for worktree workspaces, otherwise the project root). The terminal opens on the daemon machine. The shortcut works in the desktop and browser apps, not on mobile, and is ignored while focus is inside a Paseo terminal so its copy shortcut keeps working.

Requires a Windows daemon with Windows Terminal (`wt.exe`) installed.

## File paths

These shortcuts work on the active tab of the open workspace. Keys match physical positions, so they work in any input language.

- **Shift+Alt+R**: on a file tab, opens the system file manager with that file selected. On any other tab, such as an agent, opens the workspace directory. The file manager opens on the daemon machine: Explorer on Windows, Finder on macOS, and the containing folder through `xdg-open` on Linux.
- **Alt+L**: copies the file tab's path relative to the workspace directory, such as `docs/plan.md`. With text selected in the file, the selected lines follow, such as `docs/plan.md:12` or `docs/plan.md:12-18`.
- **Ctrl+Alt+L**: like Alt+L, with the absolute path.

In a source editor, the selected lines come from the editor. In a rendered view such as a Markdown preview, the selected text is searched in the file, ignoring markup and link targets; repeated text is told apart by how often it appears before the selection. When the text is not found, only the path is copied. While the paseo-doc-ask input box is open, its selected passage counts as the selection.

Paseo has no API for the active tab, so the plugin reads the tab bar. With split panes, it uses the pane last clicked or selected in. A Paseo update that changes the tab bar can break these shortcuts.
