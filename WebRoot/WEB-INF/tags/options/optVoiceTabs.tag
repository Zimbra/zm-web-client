<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ attribute name="prev" rtexprvalue="true" required="true" type="java.lang.String"  %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="voiceselected" value="${empty param.voiceselected ? 'general' : param.voiceselected}"/>

<table cellpadding="0" cellspacing="0">
    <tr class='Tabs'>
        <td class='TabSpacer'/>
        <td class='TabSpacer'/>
        <c:if test="${mailbox.features.voice}">
            <td class='TabSpacer'/>
            <td class='Tab ${voiceselected=='general' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=voice&voiceselected=general&prev=${prev}"/>">
                    <span><fmt:message key="voiceMail"/></span></a>
            </td>
	    
	    <td class='TabSpacer'/>
            <td class='Tab ${voiceselected=='notification' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=voice&voiceselected=notification&prev=${prev}"/>">
                    <span><fmt:message key="optionsVoiceNotifications"/></span></a>
            </td>
	    
	    <td class='TabSpacer'/>
            <td class='Tab ${voiceselected=='forwarding' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=voice&voiceselected=forwarding&prev=${prev}"/>">
                    <span><fmt:message key="optionsCallForwarding"/></span></a>
            </td>
	    
	    <td class='TabSpacer'/>
            <td class='Tab ${voiceselected=='screening' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=voice&voiceselected=screening&prev=${prev}"/>">
                    <span><fmt:message key="optionsCallRejection"/></span></a>
            </td>
        </c:if>
        <td class='TabFiller'>
            &nbsp;
        </td>
    </tr>
</table>
