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
#   sudo finmark copy-old-files  copy the old site's PDFs and images that the new site links to onto this server
#   sudo finmark email-setup  connect the website forms to Microsoft 365 so they can send email
#
# Nothing here touches the old website's server.
set -uo pipefail

CONF=/etc/finmark.env
WEB=/var/www/finmark
ACME=/var/www/acme
SITE_CONF=/etc/nginx/sites-available/finmark.conf
REDIRECTS=/etc/nginx/finmark-redirects.conf
OAUTH_ENV=/etc/finmark-oauth.env
FORMS_ENV=/etc/finmark-forms.env
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

    # Website forms (Download dataset, Contact us) and the Submissions page
    location ^~ /api/ { proxy_pass http://127.0.0.1:8788; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; client_max_body_size 64k; add_header Cache-Control "no-store"; }

    location ~ ^/knowledge-hub/(knowledge\.json|posts/) { add_header Cache-Control "no-cache"; try_files $uri =404; }
    location ~* \.(css|js|svg|webp|jpg|jpeg|png|gif|woff2?)$ { add_header Cache-Control "public, max-age=604800"; try_files $uri =404; }
    location / { try_files $uri $uri/ $uri.html =404; }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    client_max_body_size 50m;
EOF
  cat <<'EOF'

    # Old site files: copies on this server first (sudo finmark copy-old-files), otherwise fetched from the old server
    location @legacy { root /var/www/legacy; try_files $uri @oldserver; }
EOF
  if [ -n "$LEGACY_UPSTREAM" ]; then
    cat <<EOF
    location @oldserver {
        proxy_pass $LEGACY_UPSTREAM;
        proxy_set_header Host finmark.org.za;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_name finmark.org.za;
        proxy_intercept_errors on;
    }
EOF
  else
    printf '    location @oldserver { return 404; }\n'
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
  # keep the last 5 versions. Sorted by name (each name starts with its date and time), never by folder date,
  # and the live version is never removed.
  local live; live=$(readlink -f "$WEB/current")
  ls -1d "$WEB"/releases/*/ | sed 's:/$::' | sort -r | tail -n +6 | grep -vx "$live" | xargs -r rm -rf
  # keep this tool and the sign-in service up to date with the copy in GitHub
  cmp -s "$rel/server/finmark.sh" /usr/local/bin/finmark || install -m 755 "$rel/server/finmark.sh" /usr/local/bin/finmark
  if ! cmp -s "$rel/server/oauth-server.mjs" /opt/finmark/oauth-server.mjs; then
    install -D -m 644 "$rel/server/oauth-server.mjs" /opt/finmark/oauth-server.mjs
    [ -f "$OAUTH_ENV" ] && systemctl restart finmark-oauth
  fi
  if ! cmp -s "$rel/server/forms-server.mjs" /opt/finmark/forms-server.mjs; then
    install -D -m 644 "$rel/server/forms-server.mjs" /opt/finmark/forms-server.mjs
    systemctl restart finmark-forms 2>/dev/null || true
  fi
  ensure_forms
  ok "Website updated to version ${new:0:7}"
}

cmd_rollback() {
  load
  local cur prev; cur=$(readlink -f "$WEB/current")
  prev=$(ls -1d "$WEB"/releases/*/ | sed 's:/$::' | sort -r | grep -vx "$cur" | head -1)
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
  [ -f "$FORMS_ENV" ] && sed -i "s#^SITE_ORIGIN=.*#SITE_ORIGIN=$(origin)#" "$FORMS_ENV" && systemctl restart finmark-forms 2>/dev/null
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
  ensure_forms
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

cmd_copy_old_files() {
  load; [ -n "$LEGACY_UPSTREAM" ] || die "The old server isn't connected. Run sudo finmark setup and give its private IP."
  local site="$WEB/current/" dest=/var/www/legacy list=/tmp/finmark-old-files.txt missing=/var/log/finmark-old-files-missing.txt
  local folders='system|Publications|TOR|GBL|SADC_FI_Forum|Community_digitalisation|Gender|Training|eKYC|Covid|FSD|images/logos|images/blogs|ckeditor_assets|assets'
  step "1/3  Finding old files the new site links to"
  grep -rhoE "https?://(www\.)?finmark\.org\.za/($folders)/[^\"' )<>#?]+" "$site" \
      --include='*.html' --include='*.js' --include='*.json' --include='*.css' 2>/dev/null \
    | sed -E 's#^https?://(www\.)?finmark\.org\.za##' | sort -u > "$list"
  local total; total=$(wc -l < "$list"); ok "$total files linked"
  step "2/3  Copying them from the old server (it only reads; files already copied are skipped)"
  mkdir -p "$dest"; : > "$missing"
  local n=0 got=0 skip=0 bad=0 path file code
  while IFS= read -r path; do
    n=$((n+1)); file="$dest$(printf '%b' "${path//%/\\x}")"
    case "$file" in *..*) continue ;; esac
    if [ -s "$file" ]; then skip=$((skip+1)); continue; fi
    mkdir -p "$(dirname "$file")"
    case "$LEGACY_UPSTREAM" in
      https://*) code=$(curl -sk --noproxy '*' --max-time 120 -o "$file.part" -w '%{http_code}' \
                   --connect-to "finmark.org.za:443:${LEGACY_UPSTREAM#https://}:443" "https://finmark.org.za$path") ;;
      *) code=$(curl -s --noproxy '*' --max-time 120 -o "$file.part" -w '%{http_code}' -H 'Host: finmark.org.za' "$LEGACY_UPSTREAM$path") ;;
    esac
    if [ "$code" = 200 ]; then mv "$file.part" "$file"; got=$((got+1)); else rm -f "$file.part"; echo "$code $path" >> "$missing"; bad=$((bad+1)); fi
    [ $((n % 25)) = 0 ] && echo "  ... $n of $total"
  done < "$list"
  chmod -R a+rX "$dest"
  step "3/3  Done"
  ok "Copied $got new files, $skip already here ($(du -sh "$dest" | cut -f1) in total)"
  if [ "$bad" = 0 ]; then ok "Every linked file was found"
  else warn "$bad files aren't on the old server either (list: $missing). Those links were already broken."; fi
  warn "Landing sites (GBL, Gender, Training and so on) still come from the old server, so keep it running for now."
}

# ---------- website forms ----------
github_repo() { git -C "$REPO" remote get-url origin 2>/dev/null | sed -E 's#^.*github\.com[:/]##; s#\.git$##'; }
forms_env_set() (  # forms_env_set KEY value  (creates the file if needed; readable by root only). Runs in a subshell so the umask stays local.
  umask 077; touch "$FORMS_ENV"
  grep -v "^$1=" "$FORMS_ENV" > "$FORMS_ENV.tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$FORMS_ENV.tmp"; mv "$FORMS_ENV.tmp" "$FORMS_ENV"; chmod 600 "$FORMS_ENV"
)
ensure_forms() {
  load
  [ -f /opt/finmark/forms-server.mjs ] || { [ -f "$WEB/current/server/forms-server.mjs" ] && install -D -m 644 "$WEB/current/server/forms-server.mjs" /opt/finmark/forms-server.mjs; }
  [ -f /opt/finmark/forms-server.mjs ] || return 0
  [ -f "$FORMS_ENV" ] || { forms_env_set GITHUB_REPO "$(github_repo)"; forms_env_set SITE_ORIGIN "$(origin)"; forms_env_set MAIL_FROM data@finmark.org.za; }
  local unit=/etc/systemd/system/finmark-forms.service
  if [ ! -f "$unit" ]; then
    cat > "$unit" <<'EOF'
[Unit]
Description=FinMark Trust website forms (dataset downloads, contact)
After=network.target
[Service]
EnvironmentFile=/etc/finmark-forms.env
ExecStart=/usr/bin/node /opt/finmark/forms-server.mjs
Restart=always
DynamicUser=yes
StateDirectory=finmark-forms
StateDirectoryMode=0700
[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
  fi
  systemctl is-enabled -q finmark-forms 2>/dev/null || systemctl enable -q finmark-forms
  systemctl is-active -q finmark-forms || systemctl restart finmark-forms
  grep -q 'location ^~ /api/' "$SITE_CONF" 2>/dev/null || write_nginx
}

cmd_email_setup() {
  load; ensure_forms
  step "Website email (Microsoft 365) — values from the app registration in the guide"
  local tenant id secret from alerts
  tenant=$(ask "Directory (tenant) ID")
  id=$(ask "Application (client) ID")
  read -r -s -p "  Client secret value (it won't show as you paste): " secret; echo
  from=$(ask "Send from" "data@finmark.org.za")
  alerts=$(ask "Who gets an alert for each form (separate several with commas)" "michaeld@finmark.org.za")
  [ -n "$tenant" ] && [ -n "$id" ] && [ -n "$secret" ] && [ -n "$alerts" ] || die "All the values are needed."
  forms_env_set MAIL_TENANT_ID "$tenant"; forms_env_set MAIL_CLIENT_ID "$id"; forms_env_set MAIL_CLIENT_SECRET "$secret"
  forms_env_set MAIL_FROM "$from"; forms_env_set ALERT_TO "$alerts"
  systemctl restart finmark-forms; sleep 1
  systemctl is-active -q finmark-forms || die "The forms service didn't start (see: journalctl -u finmark-forms)"
  step "Sending a test email to ${alerts%%,*}"
  if ( set -a; . "$FORMS_ENV"; set +a; node /opt/finmark/forms-server.mjs --test-email "${alerts%%,*}" ); then ok "Test email sent. Check that inbox."
  else die "The test email didn't send. Copy the red line above into the chat."; fi
}

cmd_check() {
  load
  step "FinMark Trust website check"
  [ -n "${REPO:-}" ] && ok "Set up (test address: $TEST_HOST, live: $([ "$LIVE" = 1 ] && echo yes || echo no))" || { bad "Not set up yet: run sudo finmark setup"; return; }
  systemctl is-active -q nginx && ok "Web server running" || bad "Web server not running"
  nginx -t >/dev/null 2>&1 && ok "Web server settings valid" || bad "Web server settings have an error"
  has_cert && ok "HTTPS certificate: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$CERT/fullchain.pem | cut -d= -f2)" || warn "No HTTPS certificate yet (sudo finmark ssl)"
  [ -f "$OAUTH_ENV" ] && { systemctl is-active -q finmark-oauth && ok "Content manager sign-in running" || bad "Content manager sign-in stopped"; } || warn "Content manager sign-in not set up (sudo finmark cms-login)"
  if systemctl is-active -q finmark-forms; then grep -q '^MAIL_CLIENT_SECRET=' "$FORMS_ENV" 2>/dev/null && ok "Website forms running, email on" || warn "Website forms running, email not set up yet (sudo finmark email-setup)"
  else warn "Website forms not running yet (they start after the next update)"; fi
  systemctl is-active -q finmark-update.timer && ok "Automatic updates on" || bad "Automatic updates off"
  [ -d "$(readlink -f "$WEB/current")" ] && [ -f "$WEB/current/index.html" ] || bad "The live version's folder is missing (run: sudo finmark update --force)"
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
  copy-old-files) cmd_copy_old_files ;;
  email-setup) cmd_email_setup ;;
  *) sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//' ;;
esac
