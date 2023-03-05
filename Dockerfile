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

RUN cd /opt/zimbra/jetty_base/webapps/zimbra/public && cat login.jsp | sed -e '/\/\/ check if modern package exists/,/%>/c\%>' | sed -e '/\/\/ check if maibox is upgraded/,/%>/c\%>' | sed -e 's/value="<%=modernSupported%>"/value="true"/' | sed -e 's/value="${isUpgradedMailbox}"/value="true"/' > login.jsp.tmp
RUN cd /opt/zimbra/jetty_base/webapps/zimbra/public && mv login.jsp.tmp login.jsp
RUN cd /opt/zimbra/jetty_base/webapps/zimbra/public && cat launchZCS.jsp | sed -e '/\/\/ check if modern package exists/,/%>/c\%>' | sed -e 's/value="<%=modernSupported%>"/value="true"/' > launchZCS.jsp.tmp
RUN cd /opt/zimbra/jetty_base/webapps/zimbra/public && mv launchZCS.jsp.tmp launchZCS.jsp
