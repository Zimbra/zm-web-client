<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${mailbox.features.tagging and mailbox.hasTags}">
    <option disabled /><fmt:message key="actionOptSep"/>
    <option disabled /><fmt:message key="actionAddTag"/>
    <zm:forEachTag var="tag">
        <option <c:if test="${keys}">id="OPTAG${tag.id}"</c:if> value="t:${tag.id}" />${fn:escapeXml(tag.name)}
    </zm:forEachTag>
    <option disabled /><fmt:message key="actionOptSep"/>
    <option disabled /><fmt:message key="actionRemoveTag"/>
    <zm:forEachTag var="tag">
        <option <c:if test="${keys}">id="OPUNTAG${tag.id}"</c:if> value="u:${tag.id}" />${fn:escapeXml(tag.name)}
    </zm:forEachTag>
    <option value="u:all" /><fmt:message key ="all"/>
</c:if>
