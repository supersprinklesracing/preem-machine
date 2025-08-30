set +x;
npm ci;

cat << EOF > .env.local


EOF
echo ".env.local file created. $(wc -c .env.local)"

npx nx --tuiAutoExit --outputStyle=stream test main --forceExit;
npx nx --tuiAutoExit --outputStyle=stream build main;

echo "You have access to these tools:";
. /opt/environment_summary.sh
