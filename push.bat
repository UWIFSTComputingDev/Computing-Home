git config user.name "UWIFSTComputingDev"
git config user.email "uwi.fstguildcomputing.dev@gmail.com"

git add .

set /p commit_msg="Enter commit message: "
git commit -m "%commit_msg%"

git branch -M main
git remote set-url origin https://github.com/UWIFSTComputingDev/Computing-Home.git
git push -u origin main