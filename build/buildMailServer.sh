#!/bin/sh

mkdir -p $MIKEY_SOURCE

BRANCH="master"

REPOSITORIES=( serverCommon mikeymail mailReader )
PROGRAMS=( mikeyAPI mikeymail mailReader )

#Clone only needs to run the first time.
#git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/serverCommon.git $MIKEY_SOURCE/serverCommon
#git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeyAPI.git $MIKEY_SOURCE/mikeyAPI

for i in "${REPOSITORIES[@]}"
do
  cd $MIKEY_SOURCE/$i
  git pull origin $BRANCH
  npm install
  rm -rf $MIKEY_BUILD/$i
  rsync -rq --exclude=.git $MIKEY_SOURCE/* $MIKEY_BUILD/
  cd $MIKEY_BUILD/$i
done

#these need to be run as root, so just leave it running...
#/usr/local/elasticsearch/bin/service/elasticsearch stop
#/usr/local/elasticsearch/bin/service/elasticsearch start

for i in "${PROGRAMS[@]}"
do
  cd $MIKEY_BUILD/$i
  ./stop.sh
  ./start.sh
done