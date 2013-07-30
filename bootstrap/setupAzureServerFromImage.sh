#in the azure portal, start with the "azureMailImage", upload the prodAzureCert.pem, write in the password (one symbol, one number)

sudo -s #enter password (one symbol, one number)

vi /etc/hostname #file should just contain "<somehost>"
vi /etc/hosts #add <somehost>.meetmikey.com so it reads something like "127.0.0.1  tools.meetmikey.com localhost localhost.localdomain"
hostname <somehost>.meetmikey.com
/etc/init.d/networking restart

apt-get update -y

cd /usr/local/src

wget -O /etc/apt/sources.list.d/newrelic.list http://download.newrelic.com/debian/newrelic.list
apt-key adv --keyserver hkp://subkeys.pgp.net --recv-keys 548C16BF
apt-get update
apt-get install -y newrelic-sysmond
nrsysmond-config --set license_key=a259f8b13662ce34e45a90b7a8d16ebab2e14efb
/etc/init.d/newrelic-sysmond restart

#add the machine in route53 with a CNAME (point from X.cloudapp.net to azureMailX.meetmikey.com)
#add the value of tools:/home/mikey/.ssh/id_rsa.pub to server:/home/mikey/.ssh/authorized_keys
#add the machine to the elastic search security group in aws
#copy the latest secureConf.js file to /home/mikey/source/serverCommon/secureConf.js
#add the machine name and ssh port to serverTools/build/buildAzureServers.sh

#run /home/mikey/source/serverTools/scripts/buildAzureServer.sh