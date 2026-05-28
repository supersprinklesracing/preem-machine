set +x;
pnpm install;

cat << EOF > apps/primes/.env.local


EOF
echo ".env.local file created. $(wc -c apps/primes/.env.local)"

pnpm exec nx --tuiAutoExit --outputStyle=stream test primes --forceExit;
pnpm exec nx --tuiAutoExit --outputStyle=stream build primes;

echo "You have access to these tools:";
. /opt/environment_summary.sh
