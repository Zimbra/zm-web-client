<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<table id='skin_container_tree_top' cellspacing=0 cellpadding=0 style='width:100%'>
   <tr>
	<td>
        <%--<c:catch var="exp">--%>
        <c:set var="max" value="${mailbox.attrs.zimbraMailQuota[0]}"/>
        <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style='font-size:9px'>
                    <div style="width:160px;overflow:hidden;">
                    <b>${fn:escapeXml(empty mailbox.defaultIdentity.fromDisplay ? mailbox.name : mailbox.defaultIdentity.fromDisplay)}</b>
                    </div>
                </td>
            </tr>
            <tr>
                <td align="center" style='font-size:9px'>
                    <c:catch>
                    <fmt:message var="unlimited" key="unlimited"/>
                    <fmt:message key="quotaUsage">
                        <fmt:param value="${zm:displaySizeFractions(pageContext, mailbox.size,2)}"/>
                        <fmt:param value="${max==0 ? unlimited : zm:displaySizeFractions(pageContext, max,2)}"/>
                    </fmt:message>
                    </c:catch>    
                </td>
            </tr>
        </table>
        <%--</c:catch>
        <c:if test="${exp!=null}">
            <c:out value="${exp}"/>
        </c:if>--%>
    </td>
  </tr>
</table>
