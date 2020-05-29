FROM busybox

WORKDIR root

# copy zimbra in webapps
COPY build/dist/jetty/webapps/zimbra.war /opt/zimbra/jetty_base/webapps/zimbra/
RUN unzip /opt/zimbra/jetty_base/webapps/zimbra/zimbra.war -d /opt/zimbra/jetty_base/webapps/zimbra/
RUN rm /opt/zimbra/jetty_base/webapps/zimbra/zimbra.war
COPY WebRoot/WEB-INF/jetty-env.xml /opt/zimbra/jetty_base/etc/zimbra-jetty-env.xml.in
COPY build/dist/jetty/work/ /opt/zimbra/jetty_base/
COPY WebRoot/templates/* /opt/zimbra/conf/templates/
COPY build/web.xml /opt/zimbra/jetty_base/etc/zimbra.web.xml.in

RUN cat /opt/zimbra/jetty_base/etc/zimbra.web.xml.in | sed -e '/REDIRECTBEGIN/ s/\$/ %%comment VAR:zimbraMailMode,-->,redirect%%/' -e '/REDIRECTEND/ s/^/%%comment VAR:zimbraMailMode,<!--,redirect%% /' > /opt/zimbra/jetty_base/etc/zimbra.web.xml.in
