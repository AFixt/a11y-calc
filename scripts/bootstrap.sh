#!/usr/bin/env bash
# Install every external binary the Husky hooks and npm scripts expect.
# Idempotent: safe to re-run.
#
# Covers: trufflehog, lychee, semgrep, osv-scanner, codeql, dependency-check, zap.
# Node/npm are not installed here; install via nvm or your OS package manager.
#
# macOS is the best-supported path (Homebrew). Linux/WSL users see the
# 'install-via-release-binary' fallback and the upstream install URLs printed
# for anything brew cannot provide.
set -euo pipefail

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
NC='\033[0m'

log()  { printf "${BLUE}[bootstrap]${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}[ok]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[warn]${NC} %s\n" "$*" >&2; }
err()  { printf "${RED}[err]${NC} %s\n" "$*" >&2; }

need() { command -v "$1" >/dev/null 2>&1; }

detect_os() {
  case "$(uname -s)" in
    Darwin) echo macos ;;
    Linux)  echo linux ;;
    *)      echo other ;;
  esac
}

ensure_node() {
  if ! need node; then
    err "Node is required. Install via nvm: https://github.com/nvm-sh/nvm"
    exit 1
  fi
  required="$(cat .nvmrc 2>/dev/null || echo 22)"
  installed="$(node -v | sed 's/v//' | cut -d. -f1)"
  if [ "$installed" -lt "$required" ]; then
    err "Node >= $required required; have v$installed. Run: nvm use"
    exit 1
  fi
  ok "node $(node -v)"
}

brew_install_if_missing() {
  local tool="$1"
  local formula="${2:-$1}"
  if need "$tool"; then
    ok "$tool already installed"
    return 0
  fi
  if ! need brew; then
    warn "$tool missing and Homebrew not available — install manually"
    return 1
  fi
  log "brew install $formula"
  brew install "$formula"
}

install_linux_hint() {
  local tool="$1"
  local url="$2"
  warn "Linux/WSL: install $tool from $url"
}

OS="$(detect_os)"
log "Detected OS: $OS"

ensure_node

# --- trufflehog ---
case "$OS" in
  macos) brew_install_if_missing trufflehog ;;
  linux) need trufflehog || install_linux_hint trufflehog "https://github.com/trufflesecurity/trufflehog/releases" ;;
  *)     need trufflehog || install_linux_hint trufflehog "https://github.com/trufflesecurity/trufflehog/releases" ;;
esac

# --- lychee ---
case "$OS" in
  macos) brew_install_if_missing lychee ;;
  linux) need lychee || install_linux_hint lychee "https://github.com/lycheeverse/lychee/releases" ;;
  *)     need lychee || install_linux_hint lychee "https://github.com/lycheeverse/lychee/releases" ;;
esac

# --- semgrep ---
case "$OS" in
  macos) brew_install_if_missing semgrep ;;
  linux)
    if ! need semgrep; then
      if need pipx;    then log "pipx install semgrep"; pipx install semgrep;
      elif need pip3; then log "pip3 install --user semgrep"; pip3 install --user semgrep;
      else install_linux_hint semgrep "https://semgrep.dev/docs/getting-started/"; fi
    else ok "semgrep already installed"; fi
    ;;
esac

# --- osv-scanner ---
case "$OS" in
  macos) brew_install_if_missing osv-scanner ;;
  linux) need osv-scanner || install_linux_hint osv-scanner "https://github.com/google/osv-scanner/releases" ;;
esac

# --- codeql ---
if ! need codeql; then
  case "$OS" in
    macos)
      brew_install_if_missing codeql codeql  # homebrew cask
      ;;
    *)
      install_linux_hint codeql "https://github.com/github/codeql-cli-binaries/releases"
      ;;
  esac
else
  ok "codeql already installed"
fi

# CodeQL query packs (needed by security:codeql)
if need codeql; then
  log "codeql pack download codeql/javascript-queries"
  codeql pack download codeql/javascript-queries || warn "codeql pack download failed; re-run manually"
fi

# --- OWASP Dependency-Check ---
case "$OS" in
  macos) brew_install_if_missing dependency-check ;;
  linux)
    need dependency-check || install_linux_hint dependency-check "https://github.com/jeremylong/DependencyCheck/releases"
    ;;
esac

# --- OWASP ZAP (optional — only needed for npm run test:zap) ---
if ! need zap && ! need zap.sh; then
  case "$OS" in
    macos)
      if need brew; then
        log "brew install --cask zap"
        brew install --cask zap || warn "zap cask install failed; continue without it if you don't need test:zap"
      fi
      ;;
    *)
      install_linux_hint zap "https://www.zaproxy.org/download/"
      ;;
  esac
else
  ok "zap already installed"
fi

# --- npm dependencies ---
log "npm ci"
npm ci

log "Bootstrap complete. Run 'npm run check:all' to verify every gate locally."
