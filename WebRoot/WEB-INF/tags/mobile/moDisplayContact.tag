<%@ tag body-content="empty" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>


<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td class='zo_cv_heading'>
            <table width="100%" cellpadding="5">
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

    <c:if test="${zm:anySet(contact,'mobilePhone workPhone workPhone2 workFax homePhone homePhone2 homeFax assistantPhone otherPhone otherFax pager carPhone companyPhone callbackPhone')}">
        <%-- phones --%>

        <mo:contactSection>
            <mo:contactField isphone="true" label="MO_AB_mobile" value="${contact.mobilePhone}"/>
            <mo:contactField isphone="true" label="MO_AB_work" value="${contact.workPhone}"/>
            <mo:contactField isphone="true" label="MO_AB_work2" value="${contact.workPhone2}"/>
            <mo:contactField isphone="true" label="MO_AB_workFax" value="${contact.workFax}"/>
            <mo:contactField isphone="true" label="MO_AB_home" value="${contact.homePhone}"/>
            <mo:contactField isphone="true" label="MO_AB_home2" value="${contact.homePhone2}"/>
            <mo:contactField isphone="true" label="MO_AB_homeFax" value="${contact.homeFax}"/>
            <mo:contactField isphone="true" label="MO_AB_assistant" value="${contact.assistantPhone}"/>
            <mo:contactField isphone="true" label="MO_AB_other" value="${contact.otherPhone}"/>
            <mo:contactField isphone="true" label="MO_AB_otherFax" value="${contact.otherFax}"/>
            <mo:contactField isphone="true" label="MO_AB_pager" value="${contact.pager}"/>
            <mo:contactField isphone="true" label="MO_AB_car" value="${contact.carPhone}"/>
            <mo:contactField isphone="true" label="MO_AB_company" value="${contact.companyPhone}"/>
            <mo:contactField isphone="true" label="MO_AB_callback" value="${contact.callbackPhone}"/>
        </mo:contactSection>
        <tr><td>&nbsp;</td></tr>
    </c:if>

    <%-- email --%>
    <c:if test="${zm:anySet(contact,'email email2 email3')}">
        <mo:contactSection>
            <mo:contactField isemail="true" label="MO_AB_email" value="${contact.email}"/>
            <mo:contactField isemail="true" label="MO_AB_email2" value="${contact.email2}"/>
            <mo:contactField isemail="true" label="MO_AB_email3" value="${contact.email3}"/>
        </mo:contactSection>
        <tr><td>&nbsp;</td></tr>
    </c:if>
    <%-- url --%>
    <c:if test="${zm:anySet(contact,'workURL homeURL otherURL')}">
        <mo:contactSection>
            <mo:contactField isurl="true" label="MO_AB_work" value="${contact.workURL}"/>
            <mo:contactField isurl="true" label="MO_AB_home" value="${contact.homeURL}"/>
            <mo:contactField isurl="true" label="MO_AB_other" value="${contact.otherURL}"/>
        </mo:contactSection>
        <tr><td>&nbsp;</td></tr>
    </c:if>
    <%-- addrs --%>

    <c:if test="${zm:anySet(contact,'homeStreet homeCity homeState homePostalCode homeCountry workStreet workCity workState workPostalCode workCountry otherStreet otherCity otherState otherPostalCode otherCountry')}">
        <mo:contactSection>
            <c:if test="${zm:anySet(contact,'homeStreet homeCity homeState homePostalCode homeCountry')}">
                <mo:contactField isaddress="true" label="MO_AB_home"
                                 street="${contact.homeStreet}"
                                 city="${contact.homeCity}"
                                 state="${contact.homeState}"
                                 postalcode="${contact.homePostalCode}"
                                 country="${contact.homeCountry}"/>
            </c:if>
            <c:if test="${zm:anySet(contact,'workStreet workCity workState workPostalCode workCountry')}">
                <mo:contactField isaddress="true" label="MO_AB_work"
                                 street="${contact.workStreet}"
                                 city="${contact.workCity}"
                                 state="${contact.workState}"
                                 postalcode="${contact.workPostalCode}"
                                 country="${contact.workCountry}"/>
            </c:if>

            <c:if test="${zm:anySet(contact,'otherStreet otherCity otherState otherPostalCode otherCountry')}">
                <mo:contactField isaddress="true" label="MO_AB_work"
                                 street="${contact.otherStreet}"
                                 city="${contact.otherCity}"
                                 state="${contact.otherState}"
                                 postalcode="${contact.otherPostalCode}"
                                 country="${contact.otherCountry}"/>
            </c:if>
        </mo:contactSection>
        <tr><td>&nbsp;</td></tr>
    </c:if>

</table>