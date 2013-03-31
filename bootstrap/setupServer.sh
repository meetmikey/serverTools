sudo -s

#check if the disk is fully available
df -h
#if not, run...
#resize2fs /dev/sda1

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

#note: when starting ES for the first time, we need to run serverTools/scripts/es/bootstrap.sh

sudo /usr/local/elasticsearch/bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/1.7.0

#nagios instructions here:
#http://nagios.sourceforge.net/docs/nagioscore/3/en/quickstart-fedora.html


#iptables
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 8080
iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 443 -j REDIRECT --to-ports 8080
/etc/init.d/iptables save


#swap
#rule of thumb, swap should be 2 x memory
dd if=/dev/zero of=/swap1 bs=1024 count=3565158 #(3.4GB)
mkswap /swap1
chown root:root /swap1
chmod 0600 /swap1
swapon /swap1
echo "/swap1 swap swap defaults 0 0" >> /etc/fstab

#NewRelic
#RHEL
rpm -Uvh http://download.newrelic.com/pub/newrelic/el5/i386/newrelic-repo-5-3.noarch.rpm
yum install -y newrelic-sysmond
nrsysmond-config --set license_key=a259f8b13662ce34e45a90b7a8d16ebab2e14efb
/etc/init.d/newrelic-sysmond start
#Ubuntu
wget -O /etc/apt/sources.list.d/newrelic.list http://download.newrelic.com/debian/newrelic.list
apt-key adv --keyserver hkp://subkeys.pgp.net --recv-keys 548C16BF
apt-get update
apt-get install -y newrelic-sysmond
nrsysmond-config --set license_key=a259f8b13662ce34e45a90b7a8d16ebab2e14efb
/etc/init.d/newrelic-sysmond start



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

#vi /etc/security/limits.conf
#might have to restart or at least log out and log back in for these changes
#mikey soft nofile 32000
#mikey hard nofile 32000


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

#pick the one(s) you need...
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeymail.git
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mailReader.git
git clone https://meetmikeygit:delos%5pass@github.com/meetmikey/mikeyAPI.git

#Edit serverCommon/conf.js to add mongo credentials, etc.
#Now commit this change so future pulls will merge
git config --global user.email "mikey@mikeyteam.com"
git config --global user.name "Mikey"
#git commit -a

#for API server only...
cd /usr/local/mikey
mkdir keys
#copy in meetmikey.key, meetmikey.com.crt, gd_cert1.crt, gd_cert2.crt

#for workers server
sudo apt-get install graphicsmagick

#Pick one...
#/home/mikey/source/serverTools/build/buildAPIServer.sh
#/home/mikey/source/serverTools/build/buildMailServer.sh