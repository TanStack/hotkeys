#!/bin/sh
# Downloads the Windows keyboards from Unicode CLDR release 43 into
# <out-dir>/windows-cldr43. Needs the GitHub CLI.
set -e
out="${1:?usage: fetch-cldr.sh <out-dir>}/windows-cldr43"
mkdir -p "$out"
for id in en en-GB de de-CH fr-CH fr fr-BE fr-CA es es-419 pt pt-PT it da nb sv fi is cs sk hu tr ro sr-Latn sl et lt el ru uk bg he; do
  gh api -H 'Accept: application/vnd.github.raw' \
    "repos/unicode-org/cldr/contents/keyboards/windows/$id-t-k0-windows.xml?ref=release-43" > "$out/$id-t-k0-windows.xml"
done
