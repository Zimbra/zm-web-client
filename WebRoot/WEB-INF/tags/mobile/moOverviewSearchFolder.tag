<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderName(pageContext, folder.id)}"/>
<tr>
    <c:set var="url" value="mosearch?sfi=${folder.id}"/>
    <td class='zo_fldr' style='padding-left: ${8+folder.depth*8}px'  onclick='window.location="${zm:jsEncode(url)}"'>
        <mo:img alt='${fn:escapeXml(label)}' src="${folder.image}"/>
        ${fn:escapeXml(label)}
    </td>
</tr>
