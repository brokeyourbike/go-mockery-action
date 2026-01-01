#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply 'mockery' version argument"
  exit 1
fi

if mockery version >/dev/null 2>&1; then
  mockery_version="$(mockery version)"
else
  mockery_version="$(mockery --version)"
fi

echo "Found mockery version: $mockery_version"

if [ -z "$(echo $mockery_version | grep $1)" ]; then
  echo "Unexpected version :("
  exit 1
fi
