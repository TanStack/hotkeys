#!/bin/sh
# Dumps the xkb layouts in layout-table.json to <out-dir>/xkb.txt, and copies
# keysymdef.h next to it. Runs inside the e2e Docker image:
#   docker build -t tanstack-hotkeys-e2e-x11 e2e/docker
#   docker run --rm -u root -v "$PWD/scripts/layout-table:/work" -v "<out-dir>:/out" \
#     --entrypoint sh tanstack-hotkeys-e2e-x11 /work/dump-xkb.sh /out
set -e
out=${1:-/out}
apt-get update -qq >/dev/null && apt-get install -y -qq x11-xkb-utils x11proto-dev >/dev/null
cp /usr/include/X11/keysymdef.h "$out/"
Xvfb :9 -nolisten tcp >/dev/null 2>&1 &
sleep 1
export DISPLAY=:9
echo "@@XKB_DATA $(dpkg-query -W -f '${Version}' xkb-data)" > "$out/xkb.txt"
for spec in us gb de at ch "ch fr" fr be ca es latam pt br it nl dk no se fi is cz sk hu tr ro "ro std" hr si "rs latin" ee lt lv pl gr ru ua bg il \
  "us dvorak" "us dvp" "us colemak" "fr bepo" ara th "bg bas_phonetic" ir kr jp "us intl" "de neo" "ch de_nodeadkeys"; do
  set -- $spec; l=$1; v=${2:-}
  if [ -n "$v" ]; then args="-layout $l -variant $v"; else args="-layout $l"; fi
  echo "@@LAYOUT $l($v)"
  setxkbmap -print $args 2>/dev/null | xkbcomp -xkb - - 2>/dev/null | awk '/xkb_symbols/{f=1} f' | tr '\n' ' ' | sed -E 's/key </\nkey </g' | grep -E '^key <(TLDE|AE[0-9]{2}|AD[0-9]{2}|AC[0-9]{2}|AB[0-9]{2}|BKSL|LSGT|RALT)>'
done >> "$out/xkb.txt"
