<%@ page language="java" import="java.lang.*, java.util.*" %>
<% 
   String details = (String)request.getParameter("details");
   String nav = (String)request.getParameter("navigator");
   String prefs = (String)request.getParameter("prefs");
   System.out.println("*****  Error Reporting Test Page *****");
   System.out.println("DETAILS: " + details);
   System.out.println("NAVAGATOR: " + nav);
   System.out.println("PREFS: " + prefs);
%>
