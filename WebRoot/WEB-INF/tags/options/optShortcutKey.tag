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
<%@ attribute name="msgkey" rtexprvalue="true" required="true" %>
<%@ attribute name="suffix" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<fmt:bundle basename="/keys/ZhKeys">
    <c:set var="msgkey" value="${fn:trim(msgkey)}"/>
    <c:set var="msgkeyDisp" value="${msgkey}.display"/>
    <fmt:message var="keyseqlist" key="${msgkeyDisp}${suffix}"/>
    <c:if test="${fn:startsWith(keyseqlist, '???')}">
        <fmt:message var="keyseqlist" key="${msgkeyDisp}"/>
    </c:if>
    <fmt:message var="msgkeyDesc" key="${msgkey}.description"/>
    <c:if test="${not empty msgkeyDesc and not fn:startsWith(keyseqlist, '???')}">
        <tr>
            <td width="30%" class='shortcutKeys'>
                <c:set var="keyseqlist" value="${fn:trim(keyseqlist)}"/>
                <c:forEach var="keyseq" items="${fn:split(keyseqlist, ';')}" varStatus="keyseqStatus">
                    <c:set var="keyseq" value="${fn:trim(keyseq)}"/>
                    <c:if test="${not keyseqStatus.first}">
                        &nbsp; <fmt:message key="keyseq.or"/> &nbsp;
                    </c:if>
                    <span class='shortcutKeyCombo'>
                        <c:forEach var="key" items="${fn:split(keyseq, ',')}" varStatus="keyStatus">
                            <c:set var="key" value="${fn:trim(key)}"/>
                            <c:if test="${fn:contains(key, 'Alt+')}">
                                <span class='shortcutKey'><fmt:message key="key.Alt"/></span>
                                <c:set var="key" value="${fn:replace(key,'Alt+','')}"/>
                                <fmt:message key="keyseq.plus"/>
                            </c:if>
                            <c:if test="${fn:contains(key, 'Ctrl+')}">
                                <span class='shortcutKey'><fmt:message key="key.Ctrl"/></span>
                                <c:set var="key" value="${fn:replace(key,'Ctrl+','')}"/>
                                <fmt:message key="keyseq.plus"/>
                            </c:if>
                            <c:if test="${fn:contains(key, 'Meta+')}">
                                <span class='shortcutKey'><fmt:message key="key.Meta"/></span>
                                <c:set var="key" value="${fn:replace(key,'Meta+','')}"/>
                                <fmt:message key="keyseq.plus"/>
                            </c:if>
                            <c:if test="${fn:contains(key, 'Shift+')}">
                                <span class='shortcutKey'><fmt:message key="key.Shift"/></span>
                                <c:set var="key" value="${fn:replace(key,'Shift+','')}"/>
                                <fmt:message key="keyseq.plus"/>
                            </c:if>
                            <fmt:message var="keyMsg" key="key.${key}"/>
                            <c:if test="${fn:startsWith(keyMsg,'???')}">
                                <c:set var="keyMsg" value="${fn:escapeXml(fn:toLowerCase(key))}"/>
                            </c:if>
                            <span class='shortcutKey'>${keyMsg}</span>
                        </c:forEach>
                    </span>
                </c:forEach>
            </td>
            <td class='shortcutDescription'>${msgkeyDesc}</td>
        </tr>
    </c:if>
</fmt:bundle>