<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="${(context.folder.isMountPoint and context.folder.effectivePerm eq 'r') ? 'false' : 'true'}" neuterimages="${empty param.xim}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
    <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>

    <%-- blah, optimize this later --%>
    <c:if test="${not empty requestScope.idsMarkedUnread and not msg.isUnread}">
        <c:forEach var="unreadid" items="${requestScope.idsMarkedUnread}">
            <c:if test="${unreadid eq msg.id}">
                <zm:markMessageRead var="mmrresult" id="${msg.id}" read="${false}"/>
                <c:set var="leaveunread" value="${true}"/>
            </c:if>
        </c:forEach>
    </c:if>
</app:handleError>

<app:view mailbox="${mailbox}" title="${msg.subject}" context="${context}" selected='mail' folders="true" tags="true" searches="true" ads="${initParam.zimbraShowAds != 0 ? ads : ''}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="" action="view" context="${context}"/>
    <SCRIPT TYPE="text/javascript">
    <!--
    var zos = function() {if (zrc == 0) return; var e = document.getElementById("A"+zsr); if (e && e.href) window.location = e.href;}
    var zcs = function(c) {if (zrc == 0) return; var e = document.getElementById("C"+zsr); if (e) e.checked = c ? c : !e.checked;}
    var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
    var zmove = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPMOVE"); }}
    var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
    var zunflag = function() { zaction("OPUNFLAG"); }
    var zflag = function() { zaction("OPFLAG"); }
    var zread = function() { zaction("OPREAD"); }
    var zunread = function() { zaction("OPUNREAD"); }
    var zjunk = function() { zclick("SOPSPAM"); }
    //-->
    </SCRIPT>

    <app:keyboard cache="mail.messageView" globals="true" mailbox="${mailbox}" folders="true" tags="true">
        <c:if test="${mailbox.features.flagging}">
        <zm:bindKey message="mail.Flag" func="zflag"/>
        <zm:bindKey message="mail.UnFlag" func="zunflag"/>
        </c:if>
        <zm:bindKey message="mail.MarkRead" func="zread"/>
        <zm:bindKey message="mail.MarkUnread" func="zunread"/>
        <zm:bindKey message="mail.Spam" func="zjunk"/>
        <zm:bindKey message="mail.Delete" func="function() { zclick('SOPDELETE')}"/>

        <zm:bindKey message="mail.ShowExternalImages" id="DISPEXTIMG"/>

        <zm:bindKey message="mail.GoToInbox" id="FLDR2"/>
        <zm:bindKey message="mail.GoToDrafts" id="FLDR6"/>
        <zm:bindKey message="mail.GoToSent" id="FLDR5"/>
        <zm:bindKey message="mail.GoToTrash" id="FLDR3"/>

        <zm:bindKey message="mail.Reply" id="OPREPLY"/>
        <zm:bindKey message="mail.ReplyAll" id="OPREPLYALL"/>
        <zm:bindKey message="mail.Forward" id="OPFORW"/>

        <zm:bindKey message="mail.Close" id="CLOSE_ITEM"/>

        <zm:bindKey message="global.PreviousPage" id="PREV_ITEM"/>
        <zm:bindKey message="global.NextPage" id="NEXT_ITEM"/>
        <zm:bindKey message="global.PreviousItem" id="PREV_ITEM"/>
        <zm:bindKey message="global.NextItem" id="NEXT_ITEM"/>        

        <c:if test="${mailbox.features.tagging}">
            <zm:bindKey message="global.Tag" func="function() {zaction('OPTAG{TAGID}')}" alias="tag"/>
        </c:if>
        <zm:bindKey message="mail.MoveToFolder" func="function() {zmove('OPFLDR{FOLDERID}')}" alias="folder"/>        
    </app:keyboard>

    <form action="${fn:escapeXml(currentUrl)}" method="post">

        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:messageViewToolbar context="${context}" cursor="${cursor}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                        <c:set var="extImageUrl" value=""/>
                        <c:if test="${empty param.xim}">
                            <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
                        </c:if>
                        <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                             action="compose" paction="view" id="${msg.id}"/>
                        <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
                        <app:displayMessage mailbox="${mailbox}" message="${msg}"externalImageUrl="${extImageUrl}" showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:messageViewToolbar context="${context}" cursor="${cursor}" keys="false"/>
                </td>
            </tr>
        </table>
        <input type="hidden" name="id" value="${msg.id}"/>
        <input type="hidden" name="doMessageAction" value="1"/>
        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
    </form>

</app:view>