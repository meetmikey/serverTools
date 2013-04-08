#!/bin/sh

NAGIOS_PATH=/usr/local/nagios

cp etc/nrpe.cfg $NAGIOS_PATH/etc/
chown nagios:nagios $NAGIOS_PATH/etc/nagios.cfg
chmod 664 $NAGIOS_PATH/etc/nagios.cfg

mkdir -p $NAGIOS_PATH/libexec/custom
chown nagios:nagios $NAGIOS_PATH/libexec/custom
cp libexec/custom/* $NAGIOS_PATH/libexec/custom/
chown nagios:nagios $NAGIOS_PATH/libexec/custom/*
chmod a+x $NAGIOS_PATH/libexec/custom/*