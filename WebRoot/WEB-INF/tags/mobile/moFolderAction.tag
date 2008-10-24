<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<%--
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="_selectedIds" scope="request" value=",${ids},"/>
<c:set var="_selectedCids" scope="request" value=",${fn:join(paramValues.cid,',')},"/>
<c:forEach items="${paramValues.cid}" var="ccid">
    <c:set var="ccid" value="id_${ccid}"/>
    <c:set var="ids1" value="${fn:join(paramValues[ccid], ',')}"/>
    <c:set var="ids" value="${ids1},${ids!=null?ids:''}"/>
</c:forEach>
<c:set var="selectedCidsString" scope="request" value=",${requestScope.selectedIdsString},"/>
<c:set var="anAction"
       value="${not empty paramValues.anAction[0] ? paramValues.anAction[0] :  paramValues.anAction[1]}"/>
--%>
<mo:handleError>
<c:choose>
<c:when test="${zm:actionSet(param, 'actionSaveTag')}">
   <zm:createTag var="tag" name="${fn:escapeXml(param.tag_name)}" color="${fn:escapeXml(param.tag_color)}"/>
   <mo:status style="info">
        <fmt:message key="actionTagCreated"><fmt:param value="${fn:escapeXml(param.tag_name)}"/></fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionSaveFolder')}">
   <zm:createFolder var="folder" name="${fn:escapeXml(param.folder_name)}" parentid="${fn:escapeXml(param.parentid)}"/>
   <mo:status style="info">
        <fmt:message key="actionFolderCreated"><fmt:param value="${fn:escapeXml(param.folder_name)}"/></fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionSaveAddrFolder')}">
   <zm:createFolder view="contact" var="folder" name="${fn:escapeXml(param.folder_name)}" parentid="${fn:escapeXml(param.parentid)}"/>
   <mo:status style="info">
        <fmt:message key="actionAddressBookCreated"><fmt:param value="${fn:escapeXml(param.folder_name)}"/></fmt:message>
    </mo:status>
</c:when>
</c:choose>
</mo:handleError>    
