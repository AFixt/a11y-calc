#!/usr/bin/env sh
# Fail with a clear, actionable message if a required binary is missing from PATH.
# Called from each hook. Run scripts/bootstrap.sh to install missing binaries.
assert_bin() {
  tool="$1"
  hint="$2"
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf '\n\033[31m[husky] Missing required tool: %s\033[0m\n' "$tool" >&2
    if [ -n "$hint" ]; then
      printf '  → %s\n' "$hint" >&2
    fi
    printf '  → Run: bash scripts/bootstrap.sh\n' >&2
    printf '  → Or, to bypass (discouraged): --no-verify\n\n' >&2
    exit 1
  fi
}
