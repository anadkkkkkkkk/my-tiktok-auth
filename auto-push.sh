while true; do
  find . -type f \( -name "*.php" -o -name "*.js" \) | entr -d git add . && git commit -m "auto-update" && git push -u origin main
  sleep 2
done
