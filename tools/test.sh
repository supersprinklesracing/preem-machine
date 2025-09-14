set -eo pipefail

if [[ ! "$PWD" =~ /apps/main$ ]]; then
    cd apps/main
fi

TS_NODE_COMPILER_OPTIONS="{\"moduleResolution\":\"Node10\",\"customConditions\":null}";
node '../../node_modules/jest/bin/jest.js' "$@"
