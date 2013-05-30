#This is intended as a supplement to setupServer.sh.  Do all that stuff first.

sudo -s

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

#nginx proxy
#first, install with yum to get the nice service wrapper
#RHEL
yum install -y nginx
#Ubuntu
apt-get install -y nginx

#now, to get the latest version, build from source and copy it over top (there's probably a better way to do this)
yum install -y pcre-devel
cd /usr/local/src
wget http://nginx.org/download/nginx-1.4.1.tar.gz
tar -xvzf nginx-1.4.1.tar.gz
rm -f nginx-1.4.1.tar.gz
cd nginx-1.4.1
./configure --with-http_ssl_module
make
make install
service nginx stop
cp /usr/local/nginx/sbin/nginx /usr/sbin/nginx

cp ./config/nginx/virtual.conf /etc/nginx/conf.d/virtual.conf

chkconfig --level 345 nginx on

service nginx start