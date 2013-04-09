#!/bin/sh

NAGIOS_PATH=/usr/local/nagios

cp etc/nagios.cfg $NAGIOS_PATH/etc/
chown nagios:nagios $NAGIOS_PATH/etc/nagios.cfg
chmod 664 $NAGIOS_PATH/etc/nagios.cfg

cp etc/objects/*.cfg $NAGIOS_PATH/etc/objects/
if [ "$1" = "mikeyProd" ]; then
  cp hosts/mikeyProd.cfg $NAGIOS_PATH/etc/objects/localhost.cfg
elif [ "$1" = "mikeyDev" ]; then
  cp hosts/mikeyDev.cfg $NAGIOS_PATH/etc/objects/localhost.cfg
elif [ "$1" = "magicnotebook" ]; then
  cp hosts/magicnotebook.cfg $NAGIOS_PATH/etc/objects/localhost.cfg
else
  echo "WARNING!!! No host config specified, options: mikeyProd, mikeyDev, magicnotebook."
fi
chown nagios:nagios $NAGIOS_PATH/etc/objects/*.cfg
chmod 664 $NAGIOS_PATH/etc/objects/*.cfg

mkdir -p $NAGIOS_PATH/libexec/custom
chown nagios:nagios $NAGIOS_PATH/libexec/custom
cp libexec/custom/* $NAGIOS_PATH/libexec/custom/
chown nagios:nagios $NAGIOS_PATH/libexec/custom/*
chmod a+x $NAGIOS_PATH/libexec/custom/*

$NAGIOS_PATH/bin/nagios -v $NAGIOS_PATH/etc/nagios.cfg

su nagios -c "service nagios restart"