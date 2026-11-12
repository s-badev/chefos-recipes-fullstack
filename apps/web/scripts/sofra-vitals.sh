#!/usr/bin/env sh
# Mobile LCP/CLS (recipe-vitals.mjs: 390×844, 4× CPU, slow 4G, cold cache, median of 3) for the five public
# pages; writes docs/redesign/shots/sofra/round3/vitals-<label>.json.   sh scripts/sofra-vitals.sh <label> [base]
label=${1:-now}; base=${2:-http://localhost:3000}
out=../../docs/redesign/shots/sofra/round3/vitals-$label.json
{
  echo "["
  first=1
  for path in / /catalog /catalog/shopska-salata /about /niama-takava-stranica; do
    [ $first -eq 1 ] || echo ","
    first=0
    node scripts/recipe-vitals.mjs "$base$path" 3
  done
  echo "]"
} > "$out"
node -e "for (const r of require(require('path').resolve('$out'))) console.log(r.url.padEnd(48), r.medianLcpMs, 'ms', 'CLS', r.medianCls, r.runs.map(x => x.lcpElement).join(' | '))"
