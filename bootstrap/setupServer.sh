#!/bin/sh

yum update -y

yum install -y gcc-c++ make openssl-devel git

mkdir -p /usr/local/source
cd /usr/local/source

#node
wget http://nodejs.org/dist/v0.8.20/node-v0.8.20.tar.gz
tar xvzf node-v0.8.20.tar.gz
cd node-v0.8.20-linux-x64
./configure
make
make install
cd ../
rm -f node-v0.8.20.tar.gz

#forever
npm install forever -g
npm install jasmine-node -g


#scons (needed to build mongodb)
wget http://sourceforge.net/projects/scons/files/scons/2.2.0/scons-2.2.0.tar.gz/download
tar xvzf scons-2.2.0.tar.gz
cd scons-2.2.0
python setup.py install
cd ../
rm -f scons-2.2.0.tar.gz

#mongodb
wget http://downloads.mongodb.org/src/mongodb-src-r2.2.3.tar.gz
tar xvzf mongodb-src-r2.2.3.tar.gz
cd mongodb-src-r2.2.3
scons all
scons --prefix=/opt/mongo install
cd ../
rm -f mongodb-src-r2.2.3.tar.gz

#elastic search
wget http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.20.5.tar.gz
tar xvzf elasticsearch-0.20.5.tar.gz
cp -r elasticsearch-0.20.5 /usr/local/
ln -s /usr/local/elasticsearch-0.20.5/ /usr/local/elasticsearch
cp ../config/elasticsearch.yml /usr/local/elasticsearch/config/

#elastic search service wrapper
git clone https://github.com/elasticsearch/elasticsearch-servicewrapper.git
cp -r elasticsearch-servicewrapper/service /usr/local/elasticsearch/bin/

#note: when starting ES for the first time, we need to run serverCommon/esScripts/createIndex.sh

useradd mikey
passwd mikey #(and give him a password)

#put these things in /home/mikey/.bashrc
#export NODE_ENV="development"
#export MIKEY_SOURCE="/home/mikey/source"
#export MIKEY_BUILD="/usr/local/mikey"
#export SERVER_COMMON="$MIKEY_BUILD/serverCommon"

MIKEY_BUILD="/usr/local/mikey"

mkdir -p $MIKEY_BUILD
chown -R mikey:mikey $MIKEY_BUILD

MIKEY_LOG="/var/log/mikey"
mkdir -p $MIKEY_LOG
chown -R mikey:mikey $MIKEY_LOG
chmod a+rw -R $MIKEY_LOG

#swap instructions here:
#http://www.cyberciti.biz/faq/linux-add-a-swap-file-howto/

#nagios instructions here:
#http://nagios.sourceforge.net/docs/nagioscore/3/en/quickstart-fedora.html