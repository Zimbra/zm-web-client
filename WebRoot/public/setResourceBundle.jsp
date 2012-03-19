<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%--
Note: We are loading resource bundle in a separate jsp file so that octopus can override this easily
to load different resource bundle without any need to duplicate the entire jsp code.
--%>
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<fmt:setBundle basename="/messages/ZMsg" var="zmsg" scope="request"/>
