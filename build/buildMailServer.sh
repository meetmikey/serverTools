#!/bin/sh

mkdir -p $MIKEY_SOURCE

BRANCH="master"

REPOSITORIES=( serverCommon mikeymail mailReader )
PROGRAMS=( mikeyAPI mikeymail mailReader )

#Clone only needs to run the first time.
#git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/serverCommon.git $MIKEY_SOURCE/serverCommon
#git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeymail.git $MIKEY_SOURCE/mikeymail
#git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mailReader.git $MIKEY_SOURCE/mailReader

for i in "${REPOSITORIES[@]}"
do
  cd $MIKEY_SOURCE/$i
  git pull origin $BRANCH
  npm install
  rm -rf $MIKEY_BUILD/$i
  rsync -rq --exclude=.git $MIKEY_SOURCE/* $MIKEY_BUILD/
  cd $MIKEY_BUILD/$i
done

for i in "${PROGRAMS[@]}"
do
  cd $MIKEY_BUILD/$i
  ./stop.sh
  ./start.sh
done