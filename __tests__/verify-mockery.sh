#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply 'mockery' version argument"
  exit 1
fi

mockery_version="$(mockery --version)"
echo "Found 'mockery' version '$mockery_version'"

if [ -z "$(echo $mockery_version | grep $1)" ]; then
  echo "Unexpected version"
  exit 1
fi
