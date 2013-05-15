sudo -s

#check if the disk is fully available
df -h
#if not, run...
#resize2fs /dev/sda1

#set the hostname...
#on RHEL:
vi /etc/sysconfig/network #change HOSTNAME to <somehost>.meetmikey.com
#on debian
vi /etc/hostname
vi /etc/hosts #add <somehost>.meetmikey.com so it reads something like "127.0.0.1  tools.meetmikey.com localhost localhost.localdomain"
hostname <somehost>.meetmikey.com
#on RHEL:
service network restart
#on debian:
/etc/init.d/networking restart
#log out, log back in and check that the prompt has changed, and that the output of the "hostname" command is correct

yum update -y

yum install -y gcc-c++ make openssl-devel git

mkdir -p /usr/local/source
cd /usr/local/source

#node
wget http://nodejs.org/dist/v0.10.5/node-v0.10.5.tar.gz
tar xvzf node-v0.10.5.tar.gz
cd node-v0.10.5
./configure
make
make install
cd ../
rm -f node-v0.10.5.tar.gz

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

#elasticsearch increase number of open files
* soft nofile 64000
* hard nofile 64000

#note: when starting ES for the first time, we need to run serverTools/scripts/es/bootstrap.sh

sudo /usr/local/elasticsearch/bin/plugin -install elasticsearch/elasticsearch-mapper-attachments/1.7.0

#nagios instructions here:
#http://nagios.sourceforge.net/docs/nagioscore/3/en/quickstart-fedora.html

useradd nagios
passwd nagios

#nagios plugins:
#RHEL
yum install -y php
#Ubuntu
sudo apt-get install -y php5 libssl-dev
cd /usr/local/source
wget http://prdownloads.sourceforge.net/sourceforge/nagiosplug/nagios-plugins-1.4.16.tar.gz
tar -xvzf nagios-plugins-1.4.16.tar.gz
rm -f nagios-plugins-1.4.16.tar.gz
cd nagios-plugins-1.4.16/
./configure --with-nagios-user=nagios --with-nagios-group=nagios
make
make install

#NRPE
#RHEL
yum install -y xinetd
#Ubuntu
sudo apt-get install -y xinetd
cd /usr/local/source
wget http://prdownloads.sourceforge.net/sourceforge/nagios/nrpe-2.14.tar.gz
tar xvzf nrpe-2.14.tar.gz
rm -f nrpe-2.14.tar.gz
cd nrpe-2.14
#RHEL
./configure --enable-command-args
#Ubuntu
./configure --enable-command-args --with-ssl=/usr/bin/openssl --with-ssl-lib=/usr/lib/x86_64-linux-gnu
make all
make install-plugin
make install-daemon
make install-daemon-config
make install-xinetd
#edit /etc/xinetd.d/nrpe, comment out the "only_from" line (the security groups will enforce our firewalls)
#Add the following entry for the NRPE daemon to the /etc/services file.
#nrpe 5666/tcp # NRPE
#RHEL
service xinetd restart
#Ubuntu
/etc/init.d/xinetd restart
wget http://downloads.sourceforge.net/project/pma-oss/nagios-plugins/check_log3.pl
chmod +x check_log3.pl
mv check_log3.pl /usr/local/nagios/libexec/
#cd to serverTools/bootstrap/nrpe and run ./deployNRPE.sh

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
/etc/init.d/newrelic-sysmond restart
#Ubuntu
wget -O /etc/apt/sources.list.d/newrelic.list http://download.newrelic.com/debian/newrelic.list
apt-key adv --keyserver hkp://subkeys.pgp.net --recv-keys 548C16BF
apt-get update
apt-get install -y newrelic-sysmond
nrsysmond-config --set license_key=a259f8b13662ce34e45a90b7a8d16ebab2e14efb
/etc/init.d/newrelic-sysmond restart



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


#vi /etc/security/limits.conf
#might have to restart or at least log out and log back in for these changes
#NOTE: for elastic search machines, see the configuration above!!! (* soft nofile 64000)
mikey soft nofile 32000
mikey hard nofile 32000


#vi /etc/security/limits.conf
#have to log out and log back in for these changes
#mikey soft nofile 32000
#mikey hard nofile 32000


su mikey

#nagios instructions here:
#http://nagios.sourceforge.net/docs/nagioscore/3/en/quickstart-fedora.html
#put these things in /home/mikey/.bashrc
export NODE_ENV="production"
export MIKEY_SOURCE="/home/mikey/source"
export MIKEY_BUILD="/usr/local/mikey"
export SERVER_COMMON="$MIKEY_BUILD/serverCommon"

#azure
export CLOUD_ENV="azure"

#aws
export CLOUD_ENV="aws"


cd /home/mikey
mkdir .ssh
chmod 700 .ssh
cd .ssh
touch authorized_keys
chmod 600 authorized_keys
#ssh-keygen -t rsa -C "mikey@mikeyteam.com"

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

#GRAPHICSMAGICK

#debian
sudo apt-get install graphicsmagick

#ec2
#first install delegates - note most are available via yum, others just get the source and build individually
# all are probably NOT necessary - just make sure you have support for tiff, xml, jpeg, png
# always yum install the -devel version
ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/delegates/

#then install package
wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.18.tar.gz
tar -xvzf GraphicsMagick-1.3.18.tar.gz
cd GraphicsMagick-1.3.18.tar.gz
./configure
make
sudo make install


#setup log rotation
# add line to /etc/logrotate.conf
/var/log/mikey/*/*.log {
  daily
  rotate 20
  missingok
  notifempty
  sharedscripts
  copytruncate
  dateext
  dateformat .%Y-%m-%d-%s
}

#Pick one...
#/home/mikey/source/serverTools/build/buildAPIServer.sh
#/home/mikey/source/serverTools/build/buildMailServer.sh
