# paseo-utils

[한국어](README.ko.md)

Small keyboard conveniences for [Paseo](https://paseo.sh): open a terminal, reveal a file, copy a path, and scroll fast.

## Install

```bash
paseo plugin add git:nasus1263/paseo-utils
```

Plugins must be enabled on the daemon (**Settings → Plugins → Enable plugins**). Requires Paseo `>=0.16.0-beta.2`.

## Keys

| Key | Action |
|---|---|
| Ctrl+Shift+C | Open Windows Terminal in the file's folder or the workspace folder |
| Shift+Alt+R | Reveal the file in the file manager (Explorer, Finder, or `xdg-open`) |
| Alt+L | Copy the relative path, plus the selected lines (`docs/plan.md:12-18`) |
| Ctrl+Alt+L | Same as Alt+L, with the absolute path |
| Alt+Wheel | Scroll 5x faster (add Shift to scroll sideways) |

## Notes

- Ctrl+Shift+C needs a Windows daemon with Windows Terminal (`wt.exe`).
- The terminal and file manager open on the **daemon machine**.
- Desktop and web only.
- It reads Paseo's tab bar to find the active tab, so a Paseo update can break it. With split panes, it uses the pane you last clicked.
