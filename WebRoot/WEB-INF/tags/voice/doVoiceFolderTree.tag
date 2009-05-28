<%@ tag body-content="empty" %>
<%@ attribute name="parentid" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="skiproot" rtexprvalue="true" required="true" %>
<%@ attribute name="skipsystem" rtexprvalue="true" required="true" %>
<%@ attribute name="skiptopsearch" rtexprvalue="true" required="false" %>
<%@ attribute name="skiptrash" rtexprvalue="true" required="false" %>
<%@ attribute name="parentfolder" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.bean.ZFolderBean"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
</app:handleError>

<zm:forEachFolder var="folder" skiproot="${skiproot}" parentfolder="${parentfolder}" skipsystem="${skipsystem}" expanded="${sessionScope.expanded}" skiptopsearch="${skiptopsearch}" skiptrash="${skiptrash}">
    <app:voiceFolder folder="${folder}"/>
</zm:forEachFolder>
