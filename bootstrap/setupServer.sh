#!/bin/sh

yum update -y

yum install -y gcc-c++ make openssl-devel


mkdir -p /usr/local/source
cd /usr/local/source

wget http://nodejs.org/dist/v0.8.20/node-v0.8.20.tar.gz
tar xvzf node-v0.8.20.tar.gz
cd node-v0.8.20-linux-x64
./configure
make
make install

MIKEY_BUILD="/usr/local/mikey"

mkdir -p $MIKEY_BUILD
chown -R mikey:mikey $MIKEY_BUILD