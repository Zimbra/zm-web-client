<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:requirePost/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<zm:composeUploader var="uploader"/>    
<c:choose>
    <c:when test="${zm:actionSet(param, 'actionAttachAdd')}">
                <jsp:forward page="/h/briefcaseupload"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionChange')}">
        <c:choose>
            <c:when test="${param.viewId eq 'dv'}">
                <c:redirect url="/h/search?st=briefcase&view=dv"/>
            </c:when>
            <c:when test="${param.viewId eq 'ev'}">
                <c:redirect url="/h/search?st=briefcase&view=ev"/>
            </c:when>
            <c:when test="${param.viewId eq 'bv'}">
                <c:redirect url="/h/search?st=briefcase&view=bv"/>
            </c:when>
            <c:otherwise>
                 <c:redirect url="/h/search?st=briefcase&view=dv"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${empty ids}">
        <app:status style="Warning">No files selected</app:status>
    </c:when>
    <c:otherwise>
        <c:choose>
            <c:when test="${zm:actionSet(param, 'actionDelete')}">
                <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="count" value="${0}"/>
                <c:forEach var="briefcaseId" items="${paramValues.id}">
                    <zm:deleteBriefcase var="delBriefcase" id="${briefcaseId}"/>
                    <c:set var="count" value="${count+1}"/>
                </c:forEach>
                <app:status>
                    <fmt:message key="actionBriefDeleted">
                        <fmt:param value="${count}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
                <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="untagall" value="${fn:startsWith(actionOp, 'u:all')}"/>
                <c:choose>
                    <c:when test="${untagall}" >
                        <zm:forEachTag var="eachtag">
                            <zm:tagItem tagid="${eachtag.id}" var="result" id="${ids}" tag="false"/>
                        </zm:forEachTag>
                        <app:status>
                            <fmt:message key="${'actionBriefUntagAll'}" >
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                        <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                        <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                        <zm:tagItem tagid="${tagid}"var="result" id="${ids}" tag="${tag}"/>
                        <app:status>
                            <fmt:message key="${tag ? 'actionBriefTag' : 'actionBriefUntag'}">
                                <fmt:param value="${result.idCount}"/>
                                <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                            </fmt:message>
                        </app:status>
                    </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${fn:startsWith(folderId, 'm:')}">
                <zm:checkCrumb crumb="${param.crumb}"/>
                <c:set var="folderid" value="${fn:substring(folderId, 2, -1)}"/>
                <zm:moveItem folderid="${folderid}"var="result" id="${ids}"/>
                <zm:clearSearchCache/>
                <app:status>
                    <fmt:message key="actionBriefMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, folderid)}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionMove')}">
                <app:status style="Warning"><fmt:message key="actionNoFolderSelected"/></app:status>
            </c:when>
            <c:otherwise>
                <app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
            </c:otherwise>
        </c:choose>
    </c:otherwise>
</c:choose>
</app:handleError>