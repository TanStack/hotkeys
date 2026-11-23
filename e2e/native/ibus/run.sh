#!/usr/bin/env bash
# Starts an ibus daemon on the current X display and D-Bus session, and runs the
# given command with GTK and XIM pointed at ibus. Run it inside Xvfb and a D-Bus
# session. Needs ibus, ibus-gtk3 and the engine the tests use (ibus-libpinyin).
#   xvfb-run -a dbus-run-session -- e2e/native/ibus/run.sh pnpm test:e2e:native --project 'ibus-*'
set -euo pipefail
export GTK_IM_MODULE=ibus QT_IM_MODULE=ibus XMODIFIERS=@im=ibus

ibus-daemon --xim --daemonize --replace --panel=disable
for _ in $(seq 1 50); do
  ibus engine xkb:us::eng 2>/dev/null && break
  sleep 0.2
done
echo "ibus engine: $(ibus engine)"
ibus list-engine | grep -iE 'pinyin|xkb:us::eng' || echo 'ibus list-engine shows no pinyin engine'
trap 'ibus exit 2>/dev/null || true' EXIT
"$@"
