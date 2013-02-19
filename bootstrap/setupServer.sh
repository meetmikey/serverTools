#!/bin/sh

yum update -y

yum install -y gcc-c++ make openssl-devel git


mkdir -p /usr/local/source
cd /usr/local/source

#NODE
wget http://nodejs.org/dist/v0.8.20/node-v0.8.20.tar.gz
tar xvzf node-v0.8.20.tar.gz
cd node-v0.8.20-linux-x64
./configure
make
make install
cd ../
rm -f node-v0.8.20.tar.gz

#SCONS (needed to build mongodb)
wget http://sourceforge.net/projects/scons/files/scons/2.2.0/scons-2.2.0.tar.gz/download
tar xvzf scons-2.2.0.tar.gz
cd scons-2.2.0
python setup.py install
cd ../
rm -f scons-2.2.0.tar.gz

#MONGODB
wget http://downloads.mongodb.org/src/mongodb-src-r2.2.3.tar.gz
tar xvzf mongodb-src-r2.2.3.tar.gz
cd mongodb-src-r2.2.3
scons all
scons --prefix=/opt/mongo install
cd ../
rm -f mongodb-src-r2.2.3.tar.gz


wget http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.20.5.tar.gz
tar xvzf elasticsearch-0.20.5.tar.gz
cd elasticsearch-0.20.5
#what now?


wget http://wrapper.tanukisoftware.com/download/3.5.17/wrapper-linux-x86-32-3.5.17-pro.tar.gz


MIKEY_BUILD="/usr/local/mikey"

mkdir -p $MIKEY_BUILD
chown -R mikey:mikey $MIKEY_BUILD

MIKEY_LOG="/var/log/mikey"
mkdir -p $MIKEY_LOG
chown -R mikey:mikey $MIKEY_LOG
chmod a+rw -R $MIKEY_LOG