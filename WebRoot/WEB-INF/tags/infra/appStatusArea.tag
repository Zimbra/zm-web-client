<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:set var="emptyStatus" value="${empty requestScope.statusMessage}"/>
<c:if test="${param.dmsg == null && not emptyStatus}">
<div id="app_st_msg_div" style="display:block;">
    <table  class='${requestScope.statusClass}' cellpadding=2 cellspacing=2 align="center">
    <tr>
        <td class="Status" nowrap="nowrap">
            &nbsp;${requestScope.statusHtml ? requestScope.statusMessage : fn:escapeXml(requestScope.statusMessage)}
        </td>
        <td width="20%" align="right" nowrap="nowrap"><a onclick="return dismissMsg();" href='?dmsg&${zm:cook(pageContext.request.queryString)}' style="padding-left:5px"><fmt:message key="close"/></a>&nbsp;&nbsp;</td>
    </tr>
    </table>
</div>
</c:if>
<script>
var dismissMsg = function(){
	<c:if test="${zm:boolean(statusBlocking)}">
	try{document.getElementById("app_st_block_div").style.display='none';} catch(ex) {}
	</c:if>
	try{document.getElementById("app_st_msg_div").style.display='none';return false;} catch(ex) {return true;}
}
</script>
