#!/bin/bash
# FinMark Trust website: tools for running the site on our own Ubuntu server with nginx.
# Installed as /usr/local/bin/finmark by "setup". Every command is safe to run again.
#
#   sudo finmark setup      first-time install (asks a few questions)
#   sudo finmark ssl        get or renew the HTTPS certificate for the site's addresses
#   sudo finmark check      show whether everything is working
#   sudo finmark update     publish the latest version from GitHub now (also runs by itself every 2 minutes)
#   sudo finmark rollback   go back to the previous version of the site
#   sudo finmark golive     add finmark.org.za and www.finmark.org.za (run after the DNS change)
#   sudo finmark cms-login  add or change the GitHub sign-in details for the content manager
#
# Nothing here touches the old website's server.
set -uo pipefail

CONF=/etc/finmark.env
WEB=/var/www/finmark
ACME=/var/www/acme
SITE_CONF=/etc/nginx/sites-available/finmark.conf
REDIRECTS=/etc/nginx/finmark-redirects.conf
OAUTH_ENV=/etc/finmark-oauth.env
LOG=/var/log/finmark-update.log
CERT=finmark-site
LIVE_NAMES="finmark.org.za www.finmark.org.za"

ok()   { printf '\033[32m  ✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[33m  ! %s\033[0m\n' "$*"; }
bad()  { printf '\033[31m  ✘ %s\033[0m\n' "$*"; }
step() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die()  { bad "$*"; echo; echo "  Stopped here. Copy the red line above into the chat and ask for help."; exit 1; }
ask()  { local q=$1 def=${2:-} a; if [ -n "$def" ]; then read -r -p "  $q [$def]: " a; echo "${a:-$def}"; else read -r -p "  $q: " a; echo "$a"; fi; }

[ "$(id -u)" = 0 ] || { echo "Please run this with sudo, for example:  sudo finmark ${1:-check}"; exit 1; }
load() { [ -f "$CONF" ] && . "$CONF"; : "${LIVE:=0}" "${LEGACY_UPSTREAM:=}" "${EMAIL:=}"; }
save() { cat > "$CONF" <<EOF
# FinMark Trust website settings (written by finmark setup)
REPO=$REPO
SITE_SUBDIR=$SITE_SUBDIR
BRANCH=$BRANCH
TEST_HOST=$TEST_HOST
LEGACY_UPSTREAM=$LEGACY_UPSTREAM
EMAIL=$EMAIL
LIVE=$LIVE
EOF
}
names() { if [ "$LIVE" = 1 ]; then echo "$TEST_HOST $LIVE_NAMES"; else echo "$TEST_HOST"; fi; }
has_cert() { [ -f "/etc/letsencrypt/live/$CERT/fullchain.pem" ]; }
origin() { if [ "$LIVE" = 1 ]; then echo "https://finmark.org.za"; elif has_cert; then echo "https://$TEST_HOST"; else echo "http://$TEST_HOST"; fi; }

# ---------- nginx site ----------
site_body() {
  cat <<'EOF'
    root /var/www/finmark/current;
    index index.html;
    charset utf-8;
    add_header X-Robots-Tag $finmark_robots always;

    # Never serve the content source files, build scripts or server files
    location ~ ^/(content|scripts|server|deploy|legacy|node_modules|wireframes)/ { return 404; }
    location ~ /\.(git|github) { return 404; }
    location ~ \.(md|mjs|toml|sh)$ { return 404; }

    error_page 404 /404.html;
    location = /404.html { internal; }

    # Old finmark.org.za addresses and old files (regenerated on every update)
    include /etc/nginx/finmark-redirects.conf;

    # Content manager and its GitHub sign-in
    location ^~ /admin/ { add_header Cache-Control "no-store"; add_header X-Robots-Tag "noindex"; try_files $uri $uri/ =404; }
    location ^~ /oauth/ { proxy_pass http://127.0.0.1:8787; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }

    location ~ ^/knowledge-hub/(knowledge\.json|posts/) { add_header Cache-Control "no-cache"; try_files $uri =404; }
    location ~* \.(css|js|svg|webp|jpg|jpeg|png|gif|woff2?)$ { add_header Cache-Control "public, max-age=604800"; try_files $uri =404; }
    location / { try_files $uri $uri/ $uri.html =404; }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    client_max_body_size 50m;
EOF
  if [ -n "$LEGACY_UPSTREAM" ]; then
    cat <<EOF

    # Files that still live on the old server (fetched behind the scenes; visitors stay on this site)
    location @legacy {
        proxy_pass $LEGACY_UPSTREAM;
        proxy_set_header Host finmark.org.za;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_name finmark.org.za;
        proxy_intercept_errors on;
    }
EOF
  else
    printf '\n    location @legacy { return 404; }\n'
  fi
}

write_nginx() {
  local n; n=$(names)
  {
    echo "# FinMark Trust website. Written by 'finmark' — do not edit by hand (run: sudo finmark setup)."
    echo "map \$host \$finmark_robots { default \"\"; $TEST_HOST \"noindex, nofollow\"; }"
    echo
    echo "server {"
    echo "    listen 80 default_server;"
    [ -f /proc/net/if_inet6 ] && echo "    listen [::]:80 default_server;"
    echo "    server_name $n;"
    echo "    location ^~ /.well-known/acme-challenge/ { root $ACME; }"
    if has_cert; then
      echo "    location / { return 301 https://\$host\$request_uri; }"
      echo "}"
      echo
      echo "server {"
      echo "    listen 443 ssl http2 default_server;"
      [ -f /proc/net/if_inet6 ] && echo "    listen [::]:443 ssl http2 default_server;"
      echo "    server_name $n;"
      echo "    ssl_certificate /etc/letsencrypt/live/$CERT/fullchain.pem;"
      echo "    ssl_certificate_key /etc/letsencrypt/live/$CERT/privkey.pem;"
      [ "$LIVE" = 1 ] && echo "    if (\$host = www.finmark.org.za) { return 301 https://finmark.org.za\$request_uri; }"
    fi
    site_body
    echo "}"
  } > "$SITE_CONF.new"
  [ -f "$REDIRECTS" ] || echo "# filled in by the first update" > "$REDIRECTS"
  [ -f "$SITE_CONF" ] && cp "$SITE_CONF" "$SITE_CONF.bak"
  mv "$SITE_CONF.new" "$SITE_CONF"
  ln -sfn "$SITE_CONF" /etc/nginx/sites-enabled/finmark.conf
  rm -f /etc/nginx/sites-enabled/default
  if nginx -t 2>/tmp/finmark-nginx.txt; then
    systemctl reload nginx 2>/dev/null || systemctl restart nginx
    ok "Web server settings applied"
  else
    cat /tmp/finmark-nginx.txt
    [ -f "$SITE_CONF.bak" ] && cp "$SITE_CONF.bak" "$SITE_CONF"
    nginx -t >/dev/null 2>&1 && systemctl reload nginx
    die "The web server settings had an error, so the previous settings were kept."
  fi
}

# ---------- commands ----------
cmd_update() {
  load; [ -n "${REPO:-}" ] || die "Run 'sudo finmark setup' first."
  exec 9>/run/finmark-update.lock; flock -n 9 || { echo "  An update is already running."; return 0; }
  cd "$REPO" || die "Can't find the copy of the website at $REPO"
  git fetch -q origin "$BRANCH" 2>>"$LOG" || die "Couldn't reach GitHub (check the deploy key)."
  local new cur; new=$(git rev-parse "origin/$BRANCH"); cur=$(cat "$WEB/.deployed" 2>/dev/null || true)
  if [ "$new" = "$cur" ] && [ "${1:-}" != "--force" ]; then [ -t 1 ] && ok "Already up to date (${new:0:7})"; return 0; fi
  git reset -q --hard "origin/$BRANCH"
  local rel="$WEB/releases/$(date +%Y%m%d-%H%M%S)-${new:0:7}"
  mkdir -p "$rel"
  rsync -a --delete --exclude .git "$REPO/$SITE_SUBDIR/" "$rel/"
  echo "$(date '+%F %T') building ${new:0:7}" >> "$LOG"
  if ! ( cd "$rel" && node scripts/build-knowledge.mjs && node scripts/build-redirects.mjs ) >>"$LOG" 2>&1; then
    rm -rf "$rel"; die "The site didn't build, so the live site was left as it was. Details: $LOG"
  fi
  cp "$REDIRECTS" "$REDIRECTS.bak" 2>/dev/null || true
  cp "$rel/server/redirects.conf" "$REDIRECTS"
  if ! nginx -t >/dev/null 2>&1; then
    cp "$REDIRECTS.bak" "$REDIRECTS"; rm -rf "$rel"
    die "The new redirects had an error, so the live site was left as it was."
  fi
  ln -sfn "$rel" "$WEB/current.tmp" && mv -Tf "$WEB/current.tmp" "$WEB/current"
  systemctl reload nginx
  echo "$new" > "$WEB/.deployed"
  echo "$(date '+%F %T') live ${new:0:7}" >> "$LOG"
  ls -1dt "$WEB"/releases/*/ | tail -n +6 | xargs -r rm -rf     # keep the last 5 versions
  ok "Website updated to version ${new:0:7}"
}

cmd_rollback() {
  load
  local cur prev; cur=$(readlink -f "$WEB/current")
  prev=$(ls -1dt "$WEB"/releases/*/ | sed 's:/$::' | grep -vx "$cur" | head -1)
  [ -n "$prev" ] || die "There is no earlier version on this server to go back to."
  cp "$prev/server/redirects.conf" "$REDIRECTS"
  nginx -t >/dev/null 2>&1 || die "Couldn't switch back (web server check failed)."
  ln -sfn "$prev" "$WEB/current.tmp" && mv -Tf "$WEB/current.tmp" "$WEB/current"
  systemctl reload nginx
  ok "Back to the previous version: $(basename "$prev")"
  warn "The next push to GitHub will publish again as normal."
}

cmd_ssl() {
  load; local n d args=(); n=$(names)
  step "Getting an HTTPS certificate for: $n"
  for d in $n; do
    local ip; ip=$(getent ahostsv4 "$d" | awk 'NR==1{print $1}')
    [ -n "$ip" ] || die "$d doesn't point anywhere yet. Add its DNS record first, wait 5 minutes, then try again."
    args+=(-d "$d")
  done
  mkdir -p "$ACME"
  certbot certonly --webroot -w "$ACME" --cert-name "$CERT" "${args[@]}" --expand --non-interactive --agree-tos -m "$EMAIL" \
    --deploy-hook "systemctl reload nginx" || die "The certificate wasn't issued. Check that each address above points to this server's IP."
  ok "Certificate issued (it renews by itself)"
  write_nginx
  oauth_origin
}

oauth_origin() {
  [ -f "$OAUTH_ENV" ] || return 0
  sed -i "s#^SITE_ORIGIN=.*#SITE_ORIGIN=$(origin)#" "$OAUTH_ENV"
  systemctl restart finmark-oauth && ok "Content manager sign-in set to $(origin)"
}

cmd_cms_login() {
  load
  step "Content manager sign-in (from the GitHub OAuth app)"
  local id secret
  id=$(ask "Client ID")
  read -r -s -p "  Client secret (it won't show as you paste): " secret; echo
  [ -n "$id" ] && [ -n "$secret" ] || die "Both the Client ID and the Client secret are needed."
  umask 077
  printf 'GITHUB_CLIENT_ID=%s\nGITHUB_CLIENT_SECRET=%s\nSITE_ORIGIN=%s\n' "$id" "$secret" "$(origin)" > "$OAUTH_ENV"
  systemctl enable -q --now finmark-oauth && systemctl restart finmark-oauth
  sleep 1
  systemctl is-active -q finmark-oauth && ok "Sign-in service running" || die "The sign-in service didn't start (see: journalctl -u finmark-oauth)"
}

find_legacy() {
  local ip=$1 f=/images/logos/FSDNetwork.png code
  case "$ip" in *:*) ;; *)
    code=$(curl -sk --noproxy '*' -o /dev/null -w '%{http_code}' --max-time 8 --connect-to "finmark.org.za:443:$ip:443" "https://finmark.org.za$f")
    [ "$code" = 200 ] && { echo "https://$ip"; return 0; } ;;
  esac
  code=$(curl -s --noproxy '*' -o /dev/null -w '%{http_code}' --max-time 8 -H 'Host: finmark.org.za' "http://$ip$f")
  [ "$code" = 200 ] && { echo "http://$ip"; return 0; }
  return 1
}

cmd_setup() {
  local here; here=$(cd "$(dirname "$(readlink -f "$0")")" && pwd)
  load
  step "1/6  Questions"
  REPO=$(git -C "$here" rev-parse --show-toplevel 2>/dev/null) || die "Run this from the copy of the website cloned from GitHub."
  SITE_SUBDIR=$(realpath --relative-to="$REPO" "$here/..")
  BRANCH=$(git -C "$REPO" rev-parse --abbrev-ref HEAD)
  TEST_HOST=$(ask "Test address" "${TEST_HOST:-new.finmark.org.za}")
  EMAIL=$(ask "Email for certificate reminders" "${EMAIL:-info@finmark.org.za}")
  local ip; ip=$(ask "Old website server's private IP (blank to skip for now)" "$(echo "$LEGACY_UPSTREAM" | sed -E 's#^https?://##')")
  if [ -n "$ip" ]; then
    if LEGACY_UPSTREAM=$(find_legacy "$ip"); then ok "Old server answers at $LEGACY_UPSTREAM"
    else LEGACY_UPSTREAM=""; warn "Couldn't fetch a test file from $ip. Old files are skipped for now (run setup again later)."; fi
  else LEGACY_UPSTREAM=""; fi

  step "2/6  Installing software (a few minutes)"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq && apt-get install -y -qq nginx certbot nodejs git rsync curl >/dev/null || die "Software install failed."
  ok "nginx, certbot and Node.js $(node -v) installed"

  step "3/6  Saving settings"
  save; install -m 755 "$here/finmark.sh" /usr/local/bin/finmark
  install -D -m 644 "$here/oauth-server.mjs" /opt/finmark/oauth-server.mjs
  mkdir -p "$WEB/releases" "$ACME"; ok "Settings saved in $CONF"

  step "4/6  Automatic updates from GitHub (every 2 minutes)"
  cat > /etc/systemd/system/finmark-update.service <<'EOF'
[Unit]
Description=Publish the latest FinMark Trust website from GitHub
[Service]
Type=oneshot
ExecStart=/usr/local/bin/finmark update
EOF
  cat > /etc/systemd/system/finmark-update.timer <<'EOF'
[Unit]
Description=Check GitHub for website changes every 2 minutes
[Timer]
OnBootSec=1min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
EOF
  cat > /etc/systemd/system/finmark-oauth.service <<'EOF'
[Unit]
Description=FinMark Trust content manager GitHub sign-in
After=network.target
[Service]
EnvironmentFile=/etc/finmark-oauth.env
ExecStart=/usr/bin/node /opt/finmark/oauth-server.mjs
Restart=always
DynamicUser=yes
[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload && systemctl enable -q --now finmark-update.timer && ok "Updates switched on"

  step "5/6  Web server"
  write_nginx

  step "6/6  First publish"
  cmd_update --force
  echo
  ok "Setup finished. Next: the HTTPS step in the guide (sudo finmark ssl)."
}

cmd_golive() {
  load
  step "Go-live: adding finmark.org.za and www.finmark.org.za"
  read -r -p "  Have you already pointed finmark.org.za and www to this server's IP in DNS? (yes/no): " a
  [ "$a" = yes ] || { echo "  Do the DNS change first, wait 5 minutes, then run this again."; exit 0; }
  LIVE=1; save
  cmd_ssl
  ok "Live. Last step: update the GitHub OAuth app's two web addresses to https://finmark.org.za (see the guide)."
}

cmd_check() {
  load
  step "FinMark Trust website check"
  [ -n "${REPO:-}" ] && ok "Set up (test address: $TEST_HOST, live: $([ "$LIVE" = 1 ] && echo yes || echo no))" || { bad "Not set up yet: run sudo finmark setup"; return; }
  systemctl is-active -q nginx && ok "Web server running" || bad "Web server not running"
  nginx -t >/dev/null 2>&1 && ok "Web server settings valid" || bad "Web server settings have an error"
  has_cert && ok "HTTPS certificate: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$CERT/fullchain.pem | cut -d= -f2)" || warn "No HTTPS certificate yet (sudo finmark ssl)"
  [ -f "$OAUTH_ENV" ] && { systemctl is-active -q finmark-oauth && ok "Content manager sign-in running" || bad "Content manager sign-in stopped"; } || warn "Content manager sign-in not set up (sudo finmark cms-login)"
  systemctl is-active -q finmark-update.timer && ok "Automatic updates on" || bad "Automatic updates off"
  [ -f "$WEB/.deployed" ] && ok "Live version: $(cut -c1-7 "$WEB/.deployed"), last activity: $(tail -1 "$LOG" 2>/dev/null)" || warn "Nothing published yet"
  local code; code=$(curl -s --noproxy '*' -o /dev/null -w '%{http_code}' -H "Host: $TEST_HOST" http://127.0.0.1/index.html)
  [ "$code" = 200 ] || [ "$code" = 301 ] && ok "Home page answers" || bad "Home page answered $code"
  if [ -n "$LEGACY_UPSTREAM" ]; then
    code=$(curl -sk --noproxy '*' -o /dev/null -w '%{http_code}' -H "Host: $TEST_HOST" http://127.0.0.1/images/logos/FSDNetwork.png)
    [ "$code" = 200 ] || [ "$code" = 301 ] && ok "Old files reachable via $LEGACY_UPSTREAM" || bad "Old files answered $code"
  else warn "Old files not connected (run sudo finmark setup and give the old server's IP)"; fi
}

case "${1:-}" in
  setup) cmd_setup ;;
  update) shift; cmd_update "${1:-}" ;;
  rollback) cmd_rollback ;;
  ssl) cmd_ssl ;;
  golive) cmd_golive ;;
  cms-login) cmd_cms_login ;;
  check) cmd_check ;;
  *) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//' ;;
esac
