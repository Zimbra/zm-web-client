<%@ tag body-content="empty" dynamic-attributes="dynattrs" %><%@ tag import="java.io.*,java.util.*" %><%@ attribute name="value" rtexprvalue="true" required="true" %><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="zm" uri="com.zimbra.zm" %><%!
	static final String A_IMAGES = "com.zimbra.htmlclient:images";
	static final String V_NO_SKIN = "<noskin>";
	static final Map<String,Map<String,String>> SKIN_IMAGES = new HashMap<String,Map<String,String>>();
%><%
	PageContext pageContext = (PageContext)getJspContext();
	String skin = (String)pageContext.findAttribute("skin");
	if (skin == null) skin = V_NO_SKIN;
	Map<String,String> images = SKIN_IMAGES.get(skin);
	if (images == null) {
		images = new HashMap<String,String>();
		SKIN_IMAGES.put(skin, images);
	}
	String imageSrc = images.get(value);
	if (imageSrc == null) {
		String iconPath = (String)pageContext.findAttribute("iconPath");
		imageSrc = iconPath != null ? iconPath+"/"+value : value;
		// use default iconPath
		ServletContext servletContext = pageContext.getServletContext();
		String iconFilename = servletContext.getRealPath(imageSrc);
		File iconFile = new File(iconFilename);
		if (!iconFile.exists()) {
			imageSrc = null;
		}
		// fallback to default location
		if (imageSrc == null) {
			imageSrc = "/img/"+value;
		}
		// save so we don't have to do this again
		images.put(value, imageSrc);
	}
	pageContext.setAttribute("value", imageSrc, PageContext.PAGE_SCOPE);
%><c:url value="${zm:getImagePath(pageContext, value)}" />