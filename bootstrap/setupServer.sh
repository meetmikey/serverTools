#!/bin/sh

yum update -y

mkdir -p /usr/local/source
cd /usr/local/source

wget http://nodejs.org/dist/v0.8.15/node-v0.8.15.tar.gz
tar zxvf node-v0.8.15.tar.gz
cd node-v0.8.15
./configure
make
make install

mkdir -p /usr/local/mikey
chown -R mikey:mikey /usr/local/mikey