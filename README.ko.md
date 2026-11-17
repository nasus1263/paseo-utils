# paseo-utils

[English](README.md)

터미널 열기, 파일 위치 열기, 경로 복사, 빠른 스크롤 같은 작은 단축키를 모은 [Paseo](https://paseo.sh) 플러그인.

## 설치

```bash
paseo plugin add git:nasus1263/paseo-utils
```

데몬에서 플러그인이 켜져 있어야 한다(**Settings → Plugins → Enable plugins**). Paseo `>=0.16.0-beta.2`.

## 단축키

| 키 | 동작 |
|---|---|
| Ctrl+Shift+C | 파일 폴더(또는 워크스페이스 폴더)에서 Windows Terminal 열기 |
| Shift+Alt+R | 파일 관리자에서 파일 위치 열기(Explorer / Finder / `xdg-open`) |
| Alt+L | 상대 경로 복사, 선택 시 줄 번호 포함(`docs/plan.md:12-18`) |
| Ctrl+Alt+L | Alt+L과 같되 절대 경로 |
| Alt+휠 | 5배 빠른 스크롤 (Shift 추가 시 가로) |

## 주의

- Ctrl+Shift+C는 Windows 데몬 + Windows Terminal(`wt.exe`) 필요.
- 터미널·파일 관리자는 **데몬 PC**에서 열린다.
- 데스크톱과 웹 전용.
- 탭 바를 읽어 활성 탭을 찾으므로 Paseo 업데이트 시 깨질 수 있다. 분할 화면에서는 마지막으로 클릭한 창 기준.
