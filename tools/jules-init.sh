set +x;
npm ci;
npx nx --tuiAutoExit --outputStyle=stream test main --forceExit;
npx nx --tuiAutoExit --outputStyle=stream build main;

. /opt/environment_summary.sh;
