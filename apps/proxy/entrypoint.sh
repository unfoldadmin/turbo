#!/bin/sh
set -eu

SELECTED_CADDYFILE="/etc/caddy/Caddyfile"

if [ "${SELF_SSL:-0}" = "1" ]; then
  echo "[proxy] SELF_SSL=1: используем self-signed (tls internal)"
  cp -f /etc/caddy/Caddyfile.self "$SELECTED_CADDYFILE"
else
  echo "[proxy] SELF_SSL!=1: используем ACME (Caddyfile.ce)"
  cp -f /etc/caddy/Caddyfile.ce "$SELECTED_CADDYFILE"
fi

exec caddy run --config "$SELECTED_CADDYFILE" --adapter caddyfile
