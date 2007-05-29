<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true" neuterimages="${empty param.xim}"/>
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
    var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click()(); }
    var zaction = function(a) { var e = document.getElementById(a); if (e) { e.selected = true; zclick("SOPGO"); }}
    var zunflag = function() { zaction("OPUNFLAG"); }
    var zflag = function() { zaction("OPFLAG"); }
    var zread = function() { zaction("OPREAD"); }
    var zunread = function() { zaction("OPUNREAD"); }
    var zjunk = function() { zclick("SOPSPAM"); }
    //-->
    </SCRIPT>

    <app:keyboard globals="true">
        <zm:bindKey key="C" id="TAB_COMPOSE"/>

        <zm:bindKey key="M,F" func="zflag"/>
        <zm:bindKey key="M,N" func="zunflag"/>
        <zm:bindKey key="M,R" func="zread"/>
        <zm:bindKey key="M,U" func="zunread"/>
        <zm:bindKey key="M,J" func="zjunk"/>
        <zm:bindKey key="X" func="zcs"/>

        <zm:bindKey key="Shift+X" id="DISPEXTIMG"/>

        <zm:bindKey key="V,I; I" id="FLDR2"/>
        <zm:bindKey key="V,D" id="FLDR6"/>
        <zm:bindKey key="V,S" id="FLDR5"/>
        <zm:bindKey key="V,T" id="FLDR3"/>

        <zm:bindKey key="R" id="OPREPLY"/>
        <zm:bindKey key="A" id="OPREPLYALL"/>
        <zm:bindKey key="F" id="OPFORW"/>
        <zm:bindKey key="Esc; Z" id="CLOSE_ITEM"/>
        <zm:bindKey key="Shift+ArrowLeft; H;K" id="PREV_ITEM"/>
        <zm:bindKey key="Shift+ArrowRight; L;J" id="NEXT_ITEM"/>
    </app:keyboard>

    <form action="${currentUrl}" method="post">

        <table width=100% cellpadding="0" cellspacing="0">
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
    </form>

</app:view>