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
                    <fmt:message var="unlimited" key="unlimited"/>
                    <fmt:message key="quotaUsage">
                        <fmt:param value="${zm:displaySizeFractions(mailbox.size,2)}"/>
                        <fmt:param value="${max==0 ? unlimited : zm:displaySizeFractions(max,2)}"/>
                    </fmt:message>
                </td>
            </tr>
        </table>
    </td>
  </tr>
</table>