<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table border="0" cellpadding="0" cellspacing="4" width=100%>
    <tbody>
        <tr>
            <td colspan=2 class='shortcutIntro'>
                <fmt:message key="SC_shortcutsIntro"/>
            </td>
        </tr>
        <tr>
            <td colspan=2 style="padding:10px">
                <table class='shortcutList' cellspacing=0 cellpadding=0>
                    <app:optShortcutSection description="SC_shortcutsForAllApplications"/>
                    <app:optShortcutKey key="m" description="SC_GLOBAL_MAIL"/>
                    <app:optShortcutKey key="e" description="SC_GLOBAL_COMPOSE"/>
                    <app:optShortcutKey key="c" description="SC_GLOBAL_CONTACTS"/>
                    <app:optShortcutKey key="y" description="SC_GLOBAL_OPTIONS"/>
                    <app:optShortcutKey key="q" description="SC_GLOBAL_QUERY"/>
                </table>
                <br>
                <table class='shortcutList' cellspacing=0 cellpadding=0>
                    <app:optShortcutSection description="SC_shortcutsForList"/>
                    <app:optShortcutKey key="o" description="SC_LIST_OPEN"/>
                    <app:optShortcutKey key="j" description="SC_LIST_DOWN"/>
                    <app:optShortcutKey key="k" description="SC_LIST_UP"/>
                    <app:optShortcutKey key="n" description="SC_LIST_NEXT_PAGE"/>
                    <app:optShortcutKey key="p" description="SC_LIST_PREV_PAGE"/>
                    <app:optShortcutKey key="r" description="SC_LIST_REFRESH"/>
                    <app:optShortcutKey key="z" description="SC_LIST_CLOSE"/>
                </table>
                <br>
                <table class='shortcutList' cellspacing=0 cellpadding=0>
                    <app:optShortcutSection description="SC_shortcutsForConvView"/>
                    <app:optShortcutKey key="f" description="SC_CONV_NEXT_PAGE"/>
                    <app:optShortcutKey key="b" description="SC_CONV_NEXT_PAGE"/>
                    <app:optShortcutKey key="z" description="SC_CONV_CLOSE"/>
                    <app:optShortcutKey key="x" description="SC_MSG_SHOW_EXTERNAL_IMAGES"/>
                    <app:optShortcutKey key="1" description="SC_MSG_REPLY"/>
                    <app:optShortcutKey key="2" description="SC_MSG_REPLYALL"/>
                    <app:optShortcutKey key="3" description="SC_MSG_FORWARD"/>
                    <app:optShortcutKey key="0" description="SC_MSG_SHOW_ORIG"/>
                </table>
                <br>
                <table class='shortcutList' cellspacing=0 cellpadding=0>
                    <app:optShortcutSection description="SC_shortcutsForMessageView"/>
                    <app:optShortcutKey key="z" description="SC_MSG_CLOSE"/>
                    <app:optShortcutKey key="x" description="SC_MSG_SHOW_EXTERNAL_IMAGES"/>
                    <app:optShortcutKey key="1" description="SC_MSG_REPLY"/>
                    <app:optShortcutKey key="2" description="SC_MSG_REPLYALL"/>
                    <app:optShortcutKey key="3" description="SC_MSG_FORWARD"/>
                    <app:optShortcutKey key="0" description="SC_MSG_SHOW_ORIG"/>
                </table>
                <br>
                <table class='shortcutList' cellspacing=0 cellpadding=0>
                    <app:optShortcutSection description="SC_shortcutsForFoldersTree"/>
                    <app:optShortcutKey key="i" description="SC_FOLDER_INBOX"/>
                    <app:optShortcutKey key="s" description="SC_FOLDER_SENT"/>
                    <app:optShortcutKey key="d" description="SC_FOLDER_DRAFTS"/>
                    <app:optShortcutKey key="u" description="SC_FOLDER_JUNK"/>
                    <app:optShortcutKey key="t" description="SC_FOLDER_TRASH"/>
                </table>
                <br>
                <table class='shortcutList' cellspacing=0 cellpadding=0>
                    <app:optShortcutSection description="SC_shortcutsForOptionsView"/>
                    <app:optShortcutKey key="1" description="SC_OPTION_GENERAL"/>
                    <app:optShortcutKey key="2" description="SC_OPTION_MAIL"/>
                    <app:optShortcutKey key="3" description="SC_OPTION_ADDRESSBOOK"/>
                    <app:optShortcutKey key="4" description="SC_OPTION_SHORTCUTS"/>
                </table>
                <br>
            </td>
        </tr>
    </tbody>
</table>
