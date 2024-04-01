#!/bin/bash
echo "**** remove restrict write access for /opt/zimbra/jetty_base/webapps/ (zimbra-mbox-webclient-war)****"
chattr -i -R /opt/zimbra/jetty_base/webapps/
