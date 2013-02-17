#!/bin/sh

mkdir -p $MIKEY_SOURCE

git clone git@github.com:meetmikey/serverCommon.git $MIKEY_SOURCE/serverCommon
git clone git@github.com:meetmikey/mikeymail.git $MIKEY_SOURCE/mikeymail
git clone git@github.com:meetmikey/mailReader.git $MIKEY_SOURCE/mailReader
git clone git@github.com:meetmikey/mikeyAPI.git $MIKEY_SOURCE/mikeyAPI

cp -r $MIKEY_SOURCE/* $MIKEY_BUILD/