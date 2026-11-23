#!/usr/bin/env bash
# Builds the virtual keyboard client, starts headless sway, and runs the given
# command with WAYLAND_DISPLAY set and no X display, so browsers use Wayland.
# Needs sway, wayland-scanner, libwayland-dev, libxkbcommon-dev and a C compiler.
#   e2e/native/wayland/run.sh pnpm test:e2e:native --project 'wayland-*'
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
cache="$here/../../.cache"
mkdir -p "$cache"

wayland-scanner client-header "$here/virtual-keyboard-unstable-v1.xml" "$cache/virtual-keyboard-unstable-v1-client-protocol.h"
wayland-scanner private-code "$here/virtual-keyboard-unstable-v1.xml" "$cache/virtual-keyboard-unstable-v1-protocol.c"
# shellcheck disable=SC2046 # pkg-config prints several flags
cc -O2 -Wall -o "$cache/vkbd" -I"$cache" "$here/vkbd.c" "$cache/virtual-keyboard-unstable-v1-protocol.c" \
  $(pkg-config --cflags --libs wayland-client xkbcommon)

XDG_RUNTIME_DIR="$(mktemp -d)"
export XDG_RUNTIME_DIR
unset DISPLAY WAYLAND_DISPLAY
WLR_BACKENDS=headless WLR_RENDERER=pixman WLR_LIBINPUT_NO_DEVICES=1 \
  sway --config "$here/sway.config" >"$cache/sway.log" 2>&1 &
sway_pid=$!
trap 'kill "$sway_pid" 2>/dev/null || true' EXIT

socket=""
for _ in $(seq 1 50); do
  socket="$(find "$XDG_RUNTIME_DIR" -maxdepth 1 -name 'wayland-*' ! -name '*.lock' -print -quit)"
  [ -n "$socket" ] && break
  sleep 0.2
done
if [ -z "$socket" ]; then
  cat "$cache/sway.log"
  echo "sway didn't start" >&2
  exit 1
fi
WAYLAND_DISPLAY="$(basename "$socket")"
export WAYLAND_DISPLAY
echo "sway is running on $WAYLAND_DISPLAY"
"$@"
