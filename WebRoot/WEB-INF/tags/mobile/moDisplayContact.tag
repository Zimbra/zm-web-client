<%@ tag body-content="empty" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table width=100% cellpadding="0" cellspacing="0">
    <tr>
        <td class='zo_cv_heading'>
            <table width=100% cellpadding="5">
                <tr>
                    <td class='zo_cv_fileas'>
                        ${fn:escapeXml(contact.displayFileAs)}
                    </td>
                </tr>
                <c:if test="${not empty contact.jobTitle}">
                <tr>
                    <td class='zo_cv_title'>
                        ${fn:escapeXml(contact.jobTitle)}
                    </td>
                </tr>
                </c:if>
                <c:if test="${not empty contact.company}">
                <tr>
                    <td class='zo_cv_title'>
                        ${fn:escapeXml(contact.company)}
                    </td>
                </tr>
                </c:if>
            </table>
        </td>
    </tr>
    <c:if test="${zm:anySet(contact,'mobilePhone workPhone')}">
        <tr>
            <td>
                <div class='zo_cv_cont'>
                    <table width=100% cellpadding="5">
                        <c:if test="${not empty contact.mobilePhone}">
                            <tr>
                                <td class='zo_cv_fname'>
                                    mobile
                                </td>
                                <td class='zo_cv_fval'>
                                        ${fn:escapeXml(contact.mobilePhone)}
                                </td>
                            </tr>
                        </c:if>
                        <c:if test="${not empty contact.workPhone}">
                            <tr>
                                <td class='zo_cv_fname'>
                                    work
                                </td>
                                <td class='zo_cv_fval'>
                                        ${fn:escapeXml(contact.workPhone)}
                                </td>
                            </tr>
                        </c:if>
                    </table>
                </div>
            </td>
        </tr>
        <tr><td>&nbsp;</td></tr>
    </c:if>

    <tr>
        <td>
            <div class='zo_cv_cont'>
                <table width=100% cellpadding="5">
                    <tr>
                        <td class='zo_cv_fname'>
                            email
                        </td>
                        <td class='zo_cv_fval'>
                            ${fn:escapeXml(contact.email)}
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>