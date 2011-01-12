<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%><%@ tag body-content="empty" import="java.io.*,java.util.*,com.zimbra.webClient.servlet.SkinResources"
%><%@ attribute name="var" rtexprvalue="false" required="true"
%><%@ attribute name="value" rtexprvalue="true" required="true"
%><%@ variable name-from-attribute="var" alias="info" scope="AT_END"
%><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"
%><%@ taglib prefix="zm" uri="com.zimbra.zm"
%><%@ taglib prefix="fmt" uri="com.zimbra.i18n"
%><%!
static final String V_NO_SKIN = "<noskin>";

static File getImageSrc(File appdir, String src, Locale locale) {
    File file = new File(appdir, src);
    String filename = file.getName();
    File dir = file.getParentFile();
    String dirname = dir.getName();
    File dirdir = dir.getParentFile();
    if (!file.exists()) {
        File zfile = new File(dir.getParentFile(), "zimbra/"+file.getName());
        if (zfile.exists()) {
            file = zfile;
        }
    }
    Locale[] locales = locale.getCountry() != null
                     ? new Locale[] { locale, new Locale(locale.getLanguage()) }
                     : new Locale[] { locale };
    for (Locale loc : locales) {
        File locdir = new File(dirdir, dirname+"_"+loc);
        File locfile = new File(locdir, filename);
        if (locfile.exists()) {
            return locfile;
        }
    }
    return file;
}
%><fmt:getLocale var='locale' scope='page' /><%
PageContext pageContext = (PageContext)getJspContext();

// generate cache-id
String skin = (String)pageContext.findAttribute("skin");
if (skin == null) skin = V_NO_SKIN;
Locale locale = (Locale)pageContext.findAttribute("locale");
if (locale == null) locale = Locale.US;
String cacheId = skin + ":" + locale + ":" + value;

// get cache from SkinResources' servlet context
Map<String,SkinResources.ImageInfo> cache = null;
synchronized (this) {
    // NOTE: The context URL *must* be one serviced by SkinResources.
    ServletContext resources = pageContext.getServletContext().getContext("/zimbra/css/skin.css");
    cache = (Map<String,SkinResources.ImageInfo>)resources.getAttribute(SkinResources.A_IMAGE_CACHE);
    if (cache == null) {
        cache = new HashMap<String,SkinResources.ImageInfo>();
        resources.setAttribute(SkinResources.A_IMAGE_CACHE, cache);
    }
}

// find image
SkinResources.ImageInfo info = cache.get(cacheId);
if (info == null) {
    String iconPath = null;
    if (!value.startsWith("/")) {
        iconPath = (String)pageContext.findAttribute("iconPath");
        if (iconPath == null) iconPath = "/img";
        if (iconPath.endsWith("/")) iconPath = iconPath.substring(0, iconPath.length() - 1);
    }
    String imageSrc = iconPath != null ? iconPath+"/"+value : value;

    // find image
    ServletContext servletContext = pageContext.getServletContext();
    File basedir = new File(servletContext.getRealPath("/"));
    File imageFile = getImageSrc(basedir, imageSrc, locale);
    imageSrc = imageFile.getAbsolutePath().substring(basedir.getAbsolutePath().length());
    imageSrc = imageSrc.replace(File.separatorChar, '/');

    // save so we don't have to do this again
    info = new SkinResources.ImageInfo(imageFile, imageSrc);
    cache.put(cacheId, info);
}

// store image info in page context
pageContext.setAttribute("info", info, PageContext.PAGE_SCOPE);
%>