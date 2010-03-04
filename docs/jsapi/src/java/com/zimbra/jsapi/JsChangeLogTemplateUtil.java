/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

package	com.zimbra.jsapi;

import java.io.*;
import java.text.MessageFormat;
import java.util.*;
import java.util.zip.*;
import org.json.*;

/**
 * 
 * @author sposetti
 *
 */
public	class	JsChangeLogTemplateUtil {
	
	private	static	final	String		TEMPLATE_FILE = "index.html";
	private	static	final	String		OUTPUT_FILE = "index.html";

	private	static	final	String		DOCLINK_CLASS = "http://files.zimbra.com/docs/zimlet/zcs/{0}/jsdocs/symbols/{1}.html";

	private	String	templateDir;
	private	String	outputDir;
	
	/**
	 * Constructor.
	 * 
	 * @param	templateDir		the template directory
	 * @param	outputDir		the output directory
	 */
	public	JsChangeLogTemplateUtil(String templateDir, String outputDir) {
		this.templateDir = templateDir;
		this.outputDir = outputDir;
	}
	
	/**
	 * Writes the changelog.
	 * 
	 */
	public	void	writeChangeLog(JsInventory baselineInv, JsInventory currentInv)
	throws FileNotFoundException, IOException {

       	JsInventory.Diff diff = baselineInv.generateDiff(currentInv);
       	
       	List<JsClass> addedClasses = diff.getAddedClasses();
       	List<JsClass> removedClasses = diff.getRemovedClasses();
       	List<ModifiedJsClass> modifiedClasses = diff.getModifiedClasses();

		FileInputStream	tis = new FileInputStream(getTemplateFile());

		String template = readInputStreamAsString(tis);
		
		String addedClassesText = getClassesText(addedClasses, baselineInv.getBuildVersion());
		String removedClassesText = getClassesText(removedClasses, currentInv.getBuildVersion());
		String modifiedClassesText = getModifiedClassesText(modifiedClasses, baselineInv.getBuildVersion());
		
		template = template.replaceAll("\\$\\{baseline.version\\}", baselineInv.getBuildVersion());
		template = template.replaceAll("\\$\\{baseline.date\\}", baselineInv.getBuildDate());
		template = template.replaceAll("\\$\\{current.version\\}", currentInv.getBuildVersion());
		template = template.replaceAll("\\$\\{current.date\\}", currentInv.getBuildDate());
		
		template = template.replaceAll("\\$\\{classes-added\\}", addedClassesText);
		template = template.replaceAll("\\$\\{classes-removed\\}", removedClassesText);
		template = template.replaceAll("\\$\\{classes-modified\\}", modifiedClassesText);
		
		FileOutputStream ois = new FileOutputStream(getOutputFile());
		
		try {
			ois.write(template.getBytes());
		} finally {
			ois.close();
		}

	}

	/**
	 * Gets the classes text.
	 * 
	 * @return	the classes text
	 */
	private	String	getClassesText(List<JsClass> classes) {
		return	this.getClassesText(classes, null);
	}

	/**
	 * Gets the classes text.
	 * 
	 * @param	classes			a list of classes
	 * @param	version			the version
	 * @return	the classes text
	 */
	private	String	getClassesText(List<JsClass> classes, String version) {
		StringBuffer buf = new StringBuffer();
		
		buf.append("<ul>");

		if (classes == null || classes.size() <= 0)
			buf.append("<li>None</li>");

		Iterator it = classes.iterator();
		while (it.hasNext()) {
			JsClass clazz = (JsClass)it.next();

			buf.append("<li>");
			if (version != null) {
				String currClassLink = generateJsDocClassLink(clazz.getName(), version);
				buf.append("<a href=\"");
				buf.append(currClassLink);
				buf.append("\">");
			}
			
			buf.append(clazz.getPackage());

			if (version != null) {
				buf.append("</a>");
			}

			buf.append("</li>");
		}
		
		buf.append("</ul>");

		return	buf.toString();
	}

	/**
	 * Gets the template file.
	 * 
	 * @return	the template file
	 */
	private	File	getTemplateFile() {
		return	new File(templateDir, TEMPLATE_FILE);
	}

	/**
	 * Gets the output file.
	 * 
	 * @return	the output file
	 */
	private	File	getOutputFile() {
		return	new File(outputDir, OUTPUT_FILE);
	}

	/**
	 * Reads the input stream as a string.
	 * 
	 * @param	zipFile		the zip file
	 * @return	the string
	 */
	private	static	String	readInputStreamAsString(InputStream is)
	throws IOException {
		StringBuffer sb = new StringBuffer();
	
		String line = null;

		try {
			BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
			while ((line = reader.readLine()) != null) {
				sb.append(line).append("\n");
			}
		} finally {
			is.close();
		}

		return	sb.toString();
	}

	/**
	 * 
	 */
	public	String	getModifiedClassesText(List<ModifiedJsClass> modifiedClassList, String currVersion) {
		StringBuffer buf = new StringBuffer();
		
		if (modifiedClassList == null || modifiedClassList.size() <= 0) {
			buf.append("<ul>");
			buf.append("<li>None</li>");
			buf.append("</ul>");
		}

		Iterator it = modifiedClassList.iterator();
		while (it.hasNext()) {
			ModifiedJsClass mod = (ModifiedJsClass)it.next();

			String currClassLink = generateJsDocClassLink(mod.getName(), currVersion);
			
			buf.append("<ul>");
			buf.append("<li><h4><a href=\"");
			buf.append(currClassLink);
			buf.append("\">");
				buf.append(mod.getPackageName());
				buf.append("</a></h4>");
				buf.append("<div style=\"padding-left:25px\">");
				buf.append("<ul>");

					// write added properties
					buf.append("<li><b>PROPERTIES ADDED</b>");
					buf.append("<ul style=\"padding-left:15px\">");

					List addedProperties = mod.getAddedProperties();
					if (addedProperties.size() <= 0)
						buf.append("<li>None</li>");

					Iterator apit = addedProperties.iterator();
					while(apit.hasNext()) {
						JsClass.Property prop = (JsClass.Property)apit.next();
						buf.append("<li>");
						buf.append(prop.getName());
						buf.append("</li>");
					}

					buf.append("</ul>");
					buf.append("</li>");

					// write removed properties
					buf.append("<li><b>PROPERTIES REMOVED</b>");
					buf.append("<ul style=\"padding-left:15px\">");

					List removedProperties = mod.getRemovedProperties();
					if (removedProperties.size() <= 0)
						buf.append("<li>None</li>");

					Iterator rpit = removedProperties.iterator();
					while(rpit.hasNext()) {
						JsClass.Property prop = (JsClass.Property)rpit.next();
						buf.append("<li>");
						buf.append(prop.getName());
						buf.append("</li>");
					}

					buf.append("</ul>");
					buf.append("</li>");

					// write added methods
					buf.append("<li><b>METHODS ADDED</b>");
					buf.append("<ul style=\"padding-left:15px\">");

					List addedMethods = mod.getAddedMethods();
					if (addedMethods.size() <= 0)
						buf.append("<li>None</li>");

					Iterator amit = addedMethods.iterator();
					while(amit.hasNext()) {
						JsClass.Method meth = (JsClass.Method)amit.next();
						buf.append("<li>");
						buf.append(meth.getName());
						buf.append("</li>");
					}

					buf.append("</ul>");
					buf.append("</li>");

					// write removed methods
					buf.append("<li><b>METHODS REMOVED</b>");
					buf.append("<ul style=\"padding-left:15px\">");

					List removedMethods = mod.getRemovedMethods();
					if (removedMethods.size() <= 0)
						buf.append("<li>None</li>");

					Iterator rmit = removedMethods.iterator();
					while(rmit.hasNext()) {
						JsClass.Method meth = (JsClass.Method)rmit.next();
						buf.append("<li>");
						buf.append(meth.getName());
						buf.append("</li>");
					}

					buf.append("</ul>");
					buf.append("</li>");

					// write changed methods
					buf.append("<li><b>METHODS MODIFIED</b>");
					buf.append("<ul style=\"padding-left:15px\">");

					List changedMethods = mod.getChangedMethods();
					if (changedMethods.size() <= 0)
						buf.append("<li>None</li>");

					Iterator cmit = changedMethods.iterator();
					while(cmit.hasNext()) {
						ModifiedJsClass.ModifiedMethod meth = (ModifiedJsClass.ModifiedMethod)cmit.next();
						buf.append("<li><i>");
						buf.append(meth.getName());
						buf.append("</i>");

						buf.append("<ul style=\"padding-left:15px\">");
						buf.append("<li>Baseline Signature: <i>");
						buf.append(meth.getName());
						buf.append(meth.getPreviousSignature());
						buf.append("</i></li>");
						buf.append("<li>New Signature: <i>");
						buf.append(meth.getName());
						buf.append(meth.getNewSignature());
						buf.append("</i></li>");
						buf.append("</ul>");
						buf.append("</li>");
					}

					buf.append("</ul>");
					buf.append("</li>");

				buf.append("</ul>");
			buf.append("</li>");
			buf.append("</ul>");
		}
		
		return	buf.toString();
	}

	/**
	 * Generates a link to the public JsDoc for a given class.
	 * 
	 * @param	className		the class name
	 * @param	version			the release version
	 * @return	the link
	 */
	private		static	String	generateJsDocClassLink(String className, String version) {
		return	MessageFormat.format(DOCLINK_CLASS, new Object[] {version, className});
	}
}
