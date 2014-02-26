<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
<%@ page import="java.io.*,java.util.*,javax.naming.*,com.zimbra.cs.taglib.bean.BeanUtils"
%><%@ taglib prefix="zm" uri="com.zimbra.zm" %><%!
	//
	// Constants
	//

	// TODO: Is this defined somewhere? LocalConfig?
	static final String CONTEXT = "/service";
	static final String PATH = "/soap";

	static final String P_DATA = "data";

	static String httpPort = null;

	static {
		try {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			httpPort = (String)envCtx.lookup("httpPort");
		} 
		catch (NamingException ne) {
			// ignore
		}
	}
%><%
	// make sure we only get called securely!
	if (!request.getScheme().equals("https")) {
		response.sendError(HttpServletResponse.SC_FORBIDDEN, "Must use https to connect.");
		return;
	}

	// proxy request, capturing output
	WrappedRequest wrappedRequest = new WrappedRequest(request);
	WrappedResponse wrappedResponse = new WrappedResponse(response);

	ServletContext context = getServletContext().getContext(CONTEXT);
	RequestDispatcher dispatcher = context.getRequestDispatcher(PATH);
	dispatcher.include(wrappedRequest, wrappedResponse);

	// information
	String data = wrappedResponse.getData();
	String encodedData = data;
	if (data != null) {
		// TODO: protecting against textarea tag in text is making some assumptions
		encodedData = data.replaceAll("(</[Tt][Ee])([Xx][Tt])","$1\"+\"$2");
	}

	String server = request.getServerName();
	String port = httpPort != null && !httpPort.equals("80") ? ":"+httpPort : "";
	String url = "http://"+server+port+request.getContextPath()+"/public/insecureResponse.jsp";

	pageContext.setAttribute("data", data);
	pageContext.setAttribute("encodedData", encodedData);
	pageContext.setAttribute("server", server);
	pageContext.setAttribute("port", port);
	pageContext.setAttribute("url", url);
	pageContext.setAttribute("millis", System.currentTimeMillis());

	// no cache
	response.addHeader("Vary", "User-Agent");
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	response.setHeader("Pragma", "no-cache");

	// generate output
	response.setContentType("text/html");
%>
<html>
<body>
<!-- the form is used if data too long to transmit via request params -->
<form id=form target="iframe-${server}-${millis}" method=POST action="${url}">
<input type=hidden name=reqId value="${zm:encodeHtmlAttr(param.reqId)}">
<textarea name=data>${encodedData}</textarea>
</form>
<iframe id="iframe-${server}-${millis}" name="iframe-${server}-${millis}"></iframe>
<script>
var data = "${zm:jsEncode(data)}";
var url = "${url}";
var params = [
	"?",
	"reqId=",encodeURIComponent("${zm:jsEncode(param.reqId)}"),
	"&",
	"data=",encodeURIComponent(data)
].join("");

// submit the request
if (url.length + params.length < 2048) {
	document.getElementById("iframe-${server}-${millis}").src = url+params;
}
else {
	document.getElementById("form").submit();
}
</script>
</body>
</html>
<%!
	//
	// Classes
	//

	static class WrappedRequest extends HttpServletRequestWrapper {
		// Data
		String data;
		// Constructors
		public WrappedRequest(HttpServletRequest request) {
			super(request);
			data = request.getParameter(P_DATA);
//			data =
//				"<soap:Envelope xmlns:soap=\"http://www.w3.org/2003/05/soap-envelope\">"+
//					"<soap:Header>"+
//						"<context xmlns=\"urn:zimbra\">"+
//							"<userAgent xmlns=\"\" name=\"ZimbraWebClient - FF3.0 (Mac)\" version=\"0.0\"/>"+
//							"<sessionId xmlns=\"\" id=\"113\"/>"+
//							"<account xmlns=\"\" by=\"name\">user1@localhost</account>"+
//							"<format xmlns=\"\" type=\"js\"/>"+
//							"<authToken xmlns=\"\">"+
//								"0_1e28187778023ad967b28c08038f00e7931d7eff_69643d33363a66643764306462372d636331302d3463303" +
//								"62d393833652d6630386135313331383336373b6578703d31333a313232363031353939303436303b747970653d363a7a696d6272613b" +
//							"</authToken>"+
//						"</context>"+
//					"</soap:Header>"+
//					"<soap:Body>"+
//						"<NoOpRequest xmlns=\"urn:zimbraMail\"/>" +
//					"</soap:Body>" +
//				"</soap:Envelope>"
//			;
		}
		// paths
		public StringBuffer getRequestURL() { return new StringBuffer(CONTEXT+PATH); }
		public String getRequestURI() { return CONTEXT+PATH; }
		public String getServletPath() { return CONTEXT; }
		// parameters
		// NOTE: For some completely *unknown* reason, I am not able to
		//       override any methods related to parameters. If I compile
		//       the resulting .java file from the command-line it works
		//       fine; inside of Jetty, it barfs and dies. Why?!?!
		/***
		public Enumeration getParameterNames() {
			List nameList = new LinkedList();
			Enumeration names = super.getParameterNames();
			while (names.hasMoreElements()) {
				nameList.add(names.nextElement());
			}
			return Collections.enumeration(nameList);
		}
		public String getParameter(String name) {
			return name.equals(P_DATA) ? null : super.getParameter(name);
		}
		public Map getParameterMap() {
			Map<String,String> map = new HashMap<String,String>(super.getParameterMap());
			map.remove("data");
			return map;
		}
		// TODO: getParameterValues():String[]
		/***/
		// i/o
		public ServletInputStream getInputStream() throws IOException {
			byte[] bytes = this.data.getBytes("UTF-8");
			return new WrappedInputStream(new ByteArrayInputStream(bytes));
		}
		public BufferedReader getReader() {
			return new BufferedReader(new StringReader(this.data));
		}
		// other
		public String getMethod() { return "POST"; }
		public int getContentLength() {
			try {
				return this.data.getBytes("UTF-8").length;
			}
			catch (Exception e) {
				return super.getContentLength();
			}
		}
	}
	static class WrappedResponse extends HttpServletResponseWrapper {
		// Data
		ByteArrayOutputStream bout;
		StringWriter sout;
		String redirectLocation;
		// Constructors
		public WrappedResponse(HttpServletResponse response) {
			super(response);
		}
		// Public methods
		public String getData() {
			try {
				return this.bout != null ? new String(this.bout.toByteArray(), "UTF-8") : this.sout.toString();
			}
			catch (Exception e) {
				return "";
			}
		}
		public String getRedirectLocation() {
			return this.redirectLocation;
		}
		// other
		public void sendRedirect(String location) {
			this.redirectLocation = location;
		}
		// i/o
		public ServletOutputStream getOutputStream() throws IOException {
			if (this.bout == null) this.bout = new ByteArrayOutputStream(1024);
			return new WrappedOutputStream(this.bout);
		}
		public PrintWriter getWriter() {
			if (this.sout == null) this.sout = new StringWriter();
			return new PrintWriter(this.sout);
		}
	}
	static class WrappedInputStream extends ServletInputStream {
		// Data
		InputStream in;
		// Constructors
		public WrappedInputStream(InputStream in) {
			this.in = in;
		}
		// InputStream methods
		public int read() throws IOException {
			return in.read();
		}
		// ServletInputStream methods
		public int readLine(byte[] buffer, int off, int len) throws IOException {
			for (int i = 0; i < len; i++) {
				int b = read();
				if (b == -1) return -1;
				buffer[off + i] = (byte)b;
			}
			return len;
		}
	}
	static class WrappedOutputStream extends ServletOutputStream {
		// Data
		OutputStream out;
		// Constructors
		public WrappedOutputStream(OutputStream out) {
			this.out = out;
		}
		// OutputStream methods
		public void write(int b) throws IOException {
			this.out.write(b);
		}
		// ServletOutputStream methods
		public void print(boolean b) throws IOException { print(String.valueOf(b)); }
		public void print(char c) throws IOException { print(String.valueOf(c)); }
		public void print(double d) throws IOException { print(String.valueOf(d)); }
		public void print(float f) throws IOException { print(String.valueOf(f)); }
		public void print(int i) throws IOException { print(String.valueOf(i)); }
		public void print(long l) throws IOException { print(String.valueOf(l)); }
		public void print(String s) throws IOException { this.out.write(s.getBytes("UTF-8")); }
		public void println() throws IOException { print("\n"); }
		public void println(boolean b) throws IOException { print(b);println(); }
		public void println(char c) throws IOException { print(c);println(); }
		public void println(double d) throws IOException { print(d);println(); }
		public void println(float f) throws IOException { print(f);println(); }
		public void println(int i) throws IOException { print(i);println(); }
		public void println(long l) throws IOException { print(l);println(); }
		public void println(String s) throws IOException { print(s);println(); }
	}
%>