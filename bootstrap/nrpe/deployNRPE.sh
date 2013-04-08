#!/bin/sh

NAGIOS_PATH=/usr/local/nagios

mkdir -p $NAGIOS_PATH/libexec/custom
chown nagios:nagios $NAGIOS_PATH/libexec/custom
cp libexec/custom/* $NAGIOS_PATH/libexec/custom/
chown nagios:nagios $NAGIOS_PATH/libexec/custom/*
chmod a+x $NAGIOS_PATH/libexec/custom/*