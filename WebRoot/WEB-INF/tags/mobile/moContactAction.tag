<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="_selectedIds" scope="request" value=",${ids},"/>
<c:set var="anAction" value="${not empty paramValues.anAction[0] ? paramValues.anAction[0] :  paramValues.anAction[1]}"/>
<c:choose>
    <c:when test="${zm:actionSet(param, 'actionAdd')}">
        <zm:createContact var="result" folderid="${param.folderid}">
            <zm:field name="firstName" value="${param.firstName}"/>
            <zm:field name="lastName" value="${param.lastName}"/>
            <zm:field name="email" value="${param.email}"/>
            <zm:field name="mobilePhone" value="${param.mobilePhone}"/>
        </zm:createContact>
        <c:if test="${result!=null}">
            <app:status>
                <fmt:message key="contactCreated"/>
            </app:status>
            <c:set var="currentContactId" value="${result}" scope="request"/>
        </c:if>
        <c:if test="${result==null}">
             <c:set var="contactAddError" scope="request"/>
        </c:if>
    </c:when>
    <c:when test="${empty ids}">
        <mo:status style="Warning"><fmt:message key="actionNoContactSelected"/></mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionSave')}">
        <zm:modifyContact var="result" id="${param.id}">
            <zm:field name="firstName" value="${param.firstName}"/>
            <zm:field name="lastName" value="${param.lastName}"/>
            <zm:field name="email" value="${param.email}"/>
            <zm:field name="mobilePhone" value="${param.mobilePhone}"/>
        </zm:modifyContact>
        <c:if test="${result!=null}">
            <app:status>
                <fmt:message key="contactModified"/>
            </app:status>
            <c:set var="currentContactId" value="${result}" scope="request"/>
        </c:if>
        <c:if test="${result==null}">
             <c:set var="currentContactId" value="${result}" scope="request"/>
        </c:if>
    </c:when>
    <c:when test="${(zm:actionSet(param,'moreActions') && empty anAction) }">
        <mo:status style="Warning"><fmt:message key="actionNoActionSelected"/></mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete') || (zm:actionSet(param,'moreActions') && anAction == 'actionDelete')}">
        <zm:trashContact var="result" id="${ids}"/>
        <c:set var="op" value="x" scope="request"/>
        <mo:status>
            <fmt:message key="actionContactMovedTrash">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>

    <c:when test="${zm:actionSet(param, 'actionHardDelete' || (zm:actionSet(param,'moreActions') && anAction == 'actionHardDelete'))}">
    <zm:deleteContact var="result" id="${ids}"/>
    <c:set var="op" value="x" scope="request"/>
    <mo:status>
        <fmt:message key="actionContactHardDeleted">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    </c:when>

    <c:when test="${zm:actionSet(param, 'actionFlag') || (zm:actionSet(param,'moreActions') && anAction == 'actionFlag')}">
        <zm:flagContact var="result" id="${ids}" flag="${true}"/>
        <mo:status>
            <fmt:message key="actionContactFlag">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionUnflag') || (zm:actionSet(param,'moreActions') && anAction == 'actionUnflag')}">
        <zm:flagContact var="result" id="${ids}" flag="${false}"/>
        <mo:status>
            <fmt:message key="actionContactUnflag">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionAddTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'addTag_'))}">
        <c:set var="tag" value="${param.tagId}"/>
        <c:if test="${tag == null}">
            <c:set var="tag" value="${fn:replace(anAction,'addTag_','')}"/>
        </c:if>
        <zm:tagContact tagid="${tag}" var="result" id="${ids}" tag="${true}"/>
        <mo:status>
            <fmt:message key="actionContactTag">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionRemoveTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'remTag_'))}">
        <c:set var="tag" value="${param.tagRemoveId}"/>
        <c:if test="${tag == null}">
            <c:set var="tag" value="${fn:replace(anAction,'remTag_','')}"/>
        </c:if>
        <zm:tagContact tagid="${tag}" var="result" id="${ids}" tag="${false}"/>
        <mo:status>
            <fmt:message key="actionMessageUntag">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMove') || zm:actionSet(param,'moreActions')}">
        <c:choose>
            <c:when test="${fn:startsWith(anAction,'moveTo_')}">
            <c:set var="folderId" value="${fn:replace(anAction,'moveTo_','')}"/>
            <zm:moveContact folderid="${folderId}" var="result" id="${ids}"/>
                <mo:status>
                    <fmt:message key="actionContactMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, folderId)}"/>
                    </fmt:message>
                </mo:status>
                <c:set var="op" value="x" scope="request"/>
            </c:when>
            <c:when test="${empty param.folderId}">
                <mo:status style="Warning"><fmt:message key="actionNoFolderSelected"/></mo:status>
            </c:when>
            <c:otherwise>
                <zm:moveContact folderid="${param.folderId}" var="result" id="${ids}"/>
                <mo:status>
                    <fmt:message key="actionContactMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, param.folderId)}"/>
                    </fmt:message>
                </mo:status>
                <c:set var="op" value="x" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
</c:choose>
