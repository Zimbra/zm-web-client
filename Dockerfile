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

# https://stackoverflow.com/questions/47081507/why-does-rewriting-a-file-with-envsubst-file-file-leave-it-empty?rq=1
RUN cd /opt/zimbra/jetty_base/etc/ && cat zimbra.web.xml.in | sed -e '/REDIRECTBEGIN/ s/\$/ %%comment VAR:zimbraMailMode,-->,redirect%%/' -e '/REDIRECTEND/ s/^/%%comment VAR:zimbraMailMode,<!--,redirect%% /' > zimbra.web.xml.in.tmp
RUN cd /opt/zimbra/jetty_base/etc/ && mv zimbra.web.xml.in.tmp zimbra.web.xml.in
