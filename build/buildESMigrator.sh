mkdir -p $MIKEY_SOURCE

BRANCH="master"

REPOSITORIES=( serverTools serverCommon esMigration )

#Clone only needs to run the first time.
#git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/serverCommon.git $MIKEY_SOURCE/serverCommon
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/esMigration.git $MIKEY_SOURCE/esMigration

for i in "${REPOSITORIES[@]}"
do
  cd $MIKEY_SOURCE/$i
  git pull origin $BRANCH
  npm install
  rm -rf $MIKEY_BUILD/$i
  rsync -rq --exclude=.git $MIKEY_SOURCE/* $MIKEY_BUILD/
  cd $MIKEY_BUILD/$i
done