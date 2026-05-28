set +x;
pnpm install;

cat << EOF > .env.local


EOF
echo ".env.local file created. $(wc -c .env.local)"

pnpm exec nx --tuiAutoExit --outputStyle=stream test main --forceExit;
pnpm exec nx --tuiAutoExit --outputStyle=stream build main;

echo "You have access to these tools:";
. /opt/environment_summary.sh
