#!/bin/bash
set -e

# --- Configuration ---
APP_NAME="takovibe-resume"
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/easyresume.takovibe.com"
NODE_ENTRY="$DEPLOY_DIR/dist/server/entry.mjs"
NPM_CACHE="/home/ubuntu/.npm-cache"

# --- Environment Setup ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%F %T')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%F %T')] WARN: $1${NC}"; }
error() {
  echo -e "${RED}[$(date '+%F %T')] ERROR: $1${NC}" >&2
  exit 1
}

# --- Detect package manager ------------------------------------------------
detect_pm() {
  if command -v bun >/dev/null 2>&1; then
    PM="bun"
    log "✅ Using Bun ($(bun --version))"
  else
    PM="npm"
    log "⚙️  Bun not found, using npm ($(npm --version))"
  fi
}

prepare_env() {
  log "Preparing environment..."
  mkdir -p "$NPM_CACHE"
  [ "$PM" = "npm" ] && npm config set cache "$NPM_CACHE" --global
  export NODE_ENV=production
  export DISABLE_ESLINT_PLUGIN=true
  # Optimize for build memory usage
  export NODE_OPTIONS="--max_old_space_size=4096"
}

clean() {
  log "Cleaning old build artifacts..."
  rm -rf "$BUILD_DIR" .astro .cache || true
}

install_deps() {
  log "Installing dependencies with $PM..."
  if [ "$PM" = "bun" ]; then
    bun install --production --no-frozen-lockfile
  else
    npm ci --omit=dev --prefer-offline --no-audit --no-fund || npm install --omit=dev --prefer-offline --no-audit --no-fund
  fi
}

build() {
  log "Building Astro application..."
  if [ "$PM" = "bun" ]; then
    bun run build
  else
    npm run build
  fi
}

deploy() {
  log "Deploying to $DEPLOY_DIR..."

  # Ensure deploy directory and structure exist
  sudo mkdir -p "$DEPLOY_DIR"
  sudo chown -R "$USER":"$USER" "$DEPLOY_DIR"

  # Sync build artifacts (dist folder)
  # Note: standalone adapter puts everything in dist/
  rsync -av --delete "$BUILD_DIR"/ "$DEPLOY_DIR/dist/"

  # Sync dependencies needed for runtime (if any strictly runtime deps exist outside bundle)
  # With standalone adapter, node_modules are often bundled or needed alongside.
  # We sync node_modules to be safe for runtime dependencies like puppeteer
  rsync -av node_modules/ "$DEPLOY_DIR/node_modules/"

  # Copy config and package files
  cp -f package.json "$DEPLOY_DIR/"
  cp -f .env "$DEPLOY_DIR/" 2>/dev/null || warn "No .env file found to copy"

  sudo chown -R "$USER":"$USER" "$DEPLOY_DIR"
}

restart_server() {
  log "Managing PM2 process..."

  # Check if entry point exists before starting
  if [ ! -f "$DEPLOY_DIR/dist/server/entry.mjs" ]; then
    error "Server entry point not found at $DEPLOY_DIR/dist/server/entry.mjs"
  fi

  if pm2 list | grep -q "$APP_NAME"; then
    log "Restarting existing process..."
    pm2 restart "$APP_NAME" --update-env
  else
    log "Starting new process..."
    # Start the standalone server entry point
    pm2 start "$NODE_ENTRY" --name "$APP_NAME" --cwd "$DEPLOY_DIR"
  fi

  pm2 save
}

reload_nginx() {
  if command -v nginx >/dev/null; then
    log "Reloading Nginx..."
    sudo nginx -t && sudo systemctl reload nginx || warn "Nginx reload failed"
  else
    warn "Nginx not found, skipping reload"
  fi
}

main() {
  local start=$(date +%s)
  log "🚀 Starting Deployment for $APP_NAME"

  detect_pm
  prepare_env
  clean
  install_deps
  build
  deploy
  restart_server
  reload_nginx

  log "✅ Deployment Finished in $(($(date +%s) - start))s"
  echo -e "${YELLOW}Live at https://resume.takovibe.com${NC}"
}

main
