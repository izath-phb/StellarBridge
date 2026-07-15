Remove-Item -Path frontend\.git -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path backend\.git -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path contracts\*\.git -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path contracts\escrow_contract\.git -Recurse -Force -ErrorAction SilentlyContinue
git rm -rf --cached .
git add .
git commit -m "feat: initial commit for Hackathon"
git push -u origin main
