#!/bin/sh

mkdir -p $MIKEY_SOURCE

BRANCH="master"

REPOSITORIES=( serverCommon mikeymail mailReader mikeyAPI )

#Clone only needs to run the first time.
#git clone git@github.com:meetmikey/serverCommon.git $MIKEY_SOURCE/serverCommon
#git clone git@github.com:meetmikey/mikeymail.git $MIKEY_SOURCE/mikeymail
#git clone git@github.com:meetmikey/mailReader.git $MIKEY_SOURCE/mailReader
#git clone git@github.com:meetmikey/mikeyAPI.git $MIKEY_SOURCE/mikeyAPI

for i in "${REPOSITORIES[@]}"
do
  cd $MIKEY_SOURCE/$i
  git pull origin $BRANCH  
done

rm -rf $MIKEY_BUILD/*
rsync -r --exclude=.git $MIKEY_SOURCE/* $MIKEY_BUILD/

for i in "${REPOSITORIES[@]}"
do
  cd $MIKEY_BUILD/$i
  npm install
done