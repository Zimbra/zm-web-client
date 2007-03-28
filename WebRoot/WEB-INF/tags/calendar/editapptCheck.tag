<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:composeUploader var="uploader"/>
    <c:set var="needEditView" value="${param.action eq 'edit'}"/>
    <c:if test="${uploader.isUpload}">
        <c:choose>
            <c:when test="${uploader.isRepeatEdit}">
                <jsp:forward page="/h/repeat"/>
            </c:when>
            <c:when test="${uploader.isContactAdd or uploader.isContactSearch}">
                <%--
            <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            --%>
                <jsp:forward page="/h/addcontacts"/>
            </c:when>
            <c:when test="${uploader.isAttachAdd}">
                <%--
            <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            --%>
                <jsp:forward page="/h/attachments"/>
            </c:when>
            <c:when test="${uploader.isAttachCancel}">
                <c:set var="needEditView" value="${true}"/>
            </c:when>
            <c:when test="${uploader.isAttachDone}">
                <c:set var="needEditView" value="${true}"/>
                <c:if test="${uploader.compose.hasFileItems}">
                    <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                    <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                </c:if>
            </c:when>
            <c:when test="${uploader.isCancel}">
                <c:set var="needEditView" value="${false}"/>
            </c:when>
            <c:when test="${uploader.isSave and not uploader.compose.isValidStartTime}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptStartDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not uploader.compose.isValidEndTime}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and uploader.compose.isValidEndTime and uploader.compose.isValidStartTime and (uploader.compose.apptEndTime lt uploader.compose.apptStartTime)}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndBeforeStart"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and empty uploader.compose.subject}">
                <app:status style="Critical">
                    <fmt:message key="errorMissingSubject"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isApptCancel or uploader.isApptDelete}">
                <c:set var="needEditView" value="${true}"/>
                <app:handleError>
                    <c:set var="apptId" value="${uploader.compose.useInstance and not empty uploader.compose.exceptionInviteId ? uploader.compose.exceptionInviteId : uploader.compose.inviteId}"/>
                    <c:choose>
                        <c:when test="${not empty apptId}">
                            <zm:getMessage var="message" id="${apptId}" markread="true" neuterimages="${empty param.xim}" wanthtml="false"/>
                        </c:when>
                        <c:otherwise>
                            <c:set var="message" value="${null}"/>
                        </c:otherwise>
                    </c:choose>
                    <zm:cancelAppointment compose="${uploader.compose}" message="${message}"/>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${uploader.isApptCancel ? 'actionApptCancelled' : 'actionApptDeleted'}"/></app:status>
                    <c:set var="needEditView" value="${false}"/>
                </app:handleError>
            </c:when>
            <c:when test="${uploader.isSave}">
                <c:set var="needEditView" value="${true}"/>
                <app:handleError>
                    <c:set var="apptId" value="${uploader.compose.useInstance and not empty uploader.compose.exceptionInviteId ? uploader.compose.exceptionInviteId : uploader.compose.inviteId}"/>
                    <c:choose>
                        <c:when test="${not empty apptId}">
                            <zm:getMessage var="message" id="${apptId}" markread="true" neuterimages="${empty param.xim}" wanthtml="false"/>
                        </c:when>
                        <c:otherwise>
                            <c:set var="message" value="${null}"/>
                        </c:otherwise>
                    </c:choose>
                    <zm:saveAppointment var="createResult" compose="${uploader.compose}" message="${message}"/>
                    <c:if test="${not empty message and uploader.compose.apptFolderId ne message.folderId}">
                        <zm:moveItem var="moveResult" id="${apptId}" folderid="${uploader.compose.apptFolderId}"/>
                    </c:if>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${empty message ? 'actionApptCreated' : 'actionApptSaved'}"/></app:status>
                    <c:set var="needEditView" value="${false}"/>
                </app:handleError>
            </c:when>
        </c:choose>
    </c:if>
    
    <c:if test="${needEditView}">
        <jsp:forward page="/h/eappt"/>
    </c:if>

</app:handleError>
