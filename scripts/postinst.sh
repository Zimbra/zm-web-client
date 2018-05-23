echo "**** Fixing up the permission ****"
/opt/zimbra/libexec/zmfixperms
if [ -d /opt/zimbra/conf/templates/ ]; then
  chmod -R 755 /opt/zimbra/conf/templates
  chown -R zimbra:zimbra /opt/zimbra/conf/templates
fi
