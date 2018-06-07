#!/usr/bin/env sh

set -e

case "$@" in
  -*)
    echo yarn start $@
    exec yarn start $@
  ;;
  *  )
    exec "$@"
  ;;
esac
