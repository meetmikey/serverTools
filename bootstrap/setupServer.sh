sudo -s

yum update -y

yum install -y gcc-c++ make openssl-devel git

mkdir -p /usr/local/source
cd /usr/local/source

#node
wget http://nodejs.org/dist/v0.8.20/node-v0.8.20.tar.gz
tar xvzf node-v0.8.20.tar.gz
cd node-v0.8.20
./configure
make
make install
cd ../
rm -f node-v0.8.20.tar.gz

#forever
/usr/local/bin/npm install forever -g
/usr/local/bin/npm install jasmine-node -g


#scons (needed to build mongodb)
wget http://sourceforge.net/projects/scons/files/scons/2.2.0/scons-2.2.0.tar.gz/download
tar download
cd scons-2.2.0
python setup.py install
cd ../
rm -f download

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

sudo /usr/local/elasticsearch/bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/1.7.0
#swap instructions here:
#http://www.cyberciti.biz/faq/linux-add-a-swap-file-howto/

#nagios instructions here:
#http://nagios.sourceforge.net/docs/nagioscore/3/en/quickstart-fedora.html


iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 8080
iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 443 -j REDIRECT --to-ports 8080
/etc/init.d/iptables save


# SET UP MIKEY!
#########################

useradd mikey
passwd mikey #(and give him a password)


MIKEY_BUILD="/usr/local/mikey"

mkdir -p $MIKEY_BUILD
chown -R mikey:mikey $MIKEY_BUILD

MIKEY_LOG="/var/log/mikey"
mkdir -p $MIKEY_LOG
chown -R mikey:mikey $MIKEY_LOG
chmod a+rw -R $MIKEY_LOG

#in /etc/rc.local, add some subset of...
#/usr/local/elasticsearch/bin/service/elasticsearch start
#sleep 5

#su - mikey -c "/usr/local/mikey/mikeymail/stop.sh"
#su - mikey -c "/usr/local/mikey/mikeymail/start.sh"

#su - mikey -c "/usr/local/mikey/mailReader/stop.sh"
#su - mikey -c "/usr/local/mikey/mailReader/start.sh"

#su - mikey -c "/usr/local/mikey/mikeyAPI/stop.sh"
#su - mikey -c "/usr/local/mikey/mikeyAPI/start.sh"



su mikey

#nagios instructions here:
#http://nagios.sourceforge.net/docs/nagioscore/3/en/quickstart-fedora.html
#put these things in /home/mikey/.bashrc
#export NODE_ENV="production"
#export MIKEY_SOURCE="/home/mikey/source"
#export MIKEY_BUILD="/usr/local/mikey"
#export SERVER_COMMON="$MIKEY_BUILD/serverCommon"

cd /home/mikey
mkdir .ssh
cd .ssh
ssh-keygen -t rsa -C "mikey@mikeyteam.com"

#vi authorized_keys
#add ~/.ssh/id_rsa.pub values from any local machines that should be able to connect directly as mikey
#chmod 600 authorized_keys

cd /home/mikey
mkdir source
cd source

git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/serverTools.git
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/serverCommon.git
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeyAPI.git

#pick the one(s) you need...
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeymail.git
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mailReader.git
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeyAPI.git

#Edit serverCommon/conf.js to add mongo credentials, etc.
#Now commit this change so future pulls will merge
git config --global user.email "mikey@mikeyteam.com"
git config --global user.name "Mikey"
git commit -a

#for API server only...
cd /usr/local/mikey
mkdir keys
#copy in meetmikey.key, meetmikey.com.crt, gd_cert1.crt, gd_cert2.crt

#Pick one...
#/home/mikey/source/serverTools/build/buildAPIServer.sh
#/home/mikey/source/serverTools/build/buildMailServer.sh