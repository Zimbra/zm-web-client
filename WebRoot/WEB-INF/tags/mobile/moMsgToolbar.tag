<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2010 Zimbra, Inc.
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
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="mid" rtexprvalue="true" required="true" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>
<zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>

<table class="ToolbarBg" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
        <td  align="left" class="Padding">
            <table>
                <tr>
                    <td>
                        <a href="${fn:escapeXml(closeUrl)}#msg${mid}" class='zo_leftbutton'>
                            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                        </a>
                    </td>
                    <%--<c:if test="${uiv == '1'}">
                    <td>
                        <a class='zo_button' href="#action"><fmt:message key="MO_actions"/></a>
                    </td>
                    </c:if>--%>    
                    <td>
                        <c:choose>
                            <c:when test="${cursor.hasPrev}">
                                <zm:prevItemUrl var="prevMsgUrl" value="${urlTarget}" action='view'
                                                cursor="${cursor}" context="${context}"/>
                                <a class='zo_button' href="${fn:escapeXml(prevMsgUrl)}">
                                    <fmt:message key="MO_PREV"/>
                                </a>
                            </c:when>
                            <c:otherwise>
                                <a class='zo_button_disabled'>
                                    <fmt:message key="MO_PREV"/>
                                </a>
                            </c:otherwise>
                        </c:choose>
                    </td>
                    <td>
                        <c:choose>
                            <c:when test="${cursor.hasNext}">
                                <zm:nextItemUrl var="nextMsgUrl" value="${urlTarget}" action='view'
                                                cursor="${cursor}" context="${context}"/>
                                <a class='zo_button' href="${fn:escapeXml(nextMsgUrl)}">
                                    <fmt:message key="MO_NEXT"/>
                                </a>
                            </c:when>
                            <c:otherwise>
                                <a class='zo_button_disabled'>
                                    <fmt:message key="MO_NEXT"/>
                                </a>
                            </c:otherwise>
                        </c:choose>
                    </td>
                </tr>
            </table>
        </td>
        <td class="Padding" align="right">
            <%--<c:if test="${uiv != '1' && isTop != null && isTop}">
                <a href="#action" class='zo_button'>
                    <fmt:message key="MO_actions"/>
                </a>
            </c:if>--%>
    <c:if test="${uiv == '1'}">
            <c:if test="${context.st=='message' || context.st=='conversation'}">
                <c:url var="composeUrl" value="${urlTarget}?action=compose"/>
                <a href="${composeUrl}" class="zo_button">
                    <fmt:message key="compose"/>
                </a>
            </c:if>
            <c:if test="${context.st=='contact'}">
                <c:url var="composeUrl" value="${urlTarget}?action=add"/>
                <a href="${composeUrl}" class="zo_button">
                    <fmt:message key="add"/>
                </a>
            </c:if>
       </c:if> 
        </td>
    </tr>
</table>
