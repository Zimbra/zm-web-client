<%@ page language="java" 
         import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt" %>
<fmt:setBundle basename="adminconfig" var="configBundle" scope="session"/>
<% 
   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
   }
%>
<script type="text/javascript" src="<fmt:message key="DwtMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
<script type="text/javascript" src="<fmt:message key="AjxMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
<script type="text/javascript" src="<fmt:message key="ZaMsg" bundle="${configBundle}"/><%= ext %>?v=<%= vers %>"/></script>
