
package	com.zimbra.jsapi;

import java.io.*;
import java.util.*;
import java.util.zip.*;
import org.json.*;

/**
 * 
 * @author sposetti
 *
 */
public	class	ChangeLogTemplate {
	
	private	static	final	String		TEMPLATE_FILE = "index.html";
	private	static	final	String		OUTPUT_FILE = "index.html";
	
	private	String	previousLabel;
	private	String	currentLabel;
	private	String	templateDir;
	private	String	outputDir;
	
	/**
	 * Constructor.
	 * 
	 */
	public	ChangeLogTemplate(String previousLabel, String currentLabel, String templateDir, String outputDir) {
		this.previousLabel = previousLabel;
		this.currentLabel = currentLabel;
		this.templateDir = templateDir;
		this.outputDir = outputDir;
	}
	
	/**
	 * 
	 */
	public	void	writeTemplate(List<JsClass> addedClasses, List<JsClass> removedClasses, List<ModifiedJsClass> modifiedClasses)
	throws FileNotFoundException, IOException {

		FileInputStream	tis = new FileInputStream(getTemplateFile());

		String template = readInputStreamAsString(tis);
		
		String addedClassesText = getClassesText(addedClasses);
		String removedClassesText = getClassesText(removedClasses);
		String modifiedClassesText = getModifiedClassesText(modifiedClasses);
		
		template = template.replaceAll("\\$\\{classes-added\\}",addedClassesText);
		template = template.replaceAll("\\$\\{classes-removed\\}",removedClassesText);
		template = template.replaceAll("\\$\\{classes-modified\\}",modifiedClassesText);
		
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
		StringBuffer buf = new StringBuffer();
		
		buf.append("<ul>");

		if (classes == null || classes.size() <= 0)
			buf.append("<li>None</li>");

		Iterator it = classes.iterator();
		while (it.hasNext()) {
			JsClass clazz = (JsClass)it.next();
			
			buf.append("<li>");
			buf.append(clazz.getPackage());
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
	public	String	getModifiedClassesText(List<ModifiedJsClass> modifiedClassList) {
		StringBuffer buf = new StringBuffer();
		
		if (modifiedClassList == null || modifiedClassList.size() <= 0) {
			buf.append("<ul>");
			buf.append("<li>None</li>");
			buf.append("</ul>");
		}

		Iterator it = modifiedClassList.iterator();
		while (it.hasNext()) {
			ModifiedJsClass mod = (ModifiedJsClass)it.next();

			buf.append("<ul>");
			buf.append("<li><h4><a href=\"#\">");
				buf.append(mod.getPackageName());
				buf.append("</a></h4>");
				buf.append("<div style=\"padding-left:25px\">");
				buf.append("<ul>");

					// write added properties
					buf.append("<li><b>PROPERTIES: ADDED</b>");
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
					buf.append("<li><b>PROPERTIES: REMOVED</b>");
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
					buf.append("<li><b>METHODS: ADDED</b>");
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
					buf.append("<li><b>METHODS: REMOVED</b>");
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
					buf.append("<li><b>METHODS: MODIFIED</b>");
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
						buf.append("<li>Previous Signature: <i>");
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
		
		/*
		 * 	<ul>
	<li><h4><a href="">test</a></h4>
		<div style="padding-left:25px">
		<ul>
			<li>PROPERTIES: ADDED
				<ul style="padding-left:15px">
					<li>XYZ</li>
				</ul>
			</li>
			<li>PROPERTIES: REMOVED
				<ul style="padding-left:15px">
					<li>XYZ</li>
				</ul>
			</li>
			<li>METHODS: ADDED
				<ul style="padding-left:15px">
					<li>XYZ</li>
				</ul>
			</li>
			<li>METHODS: REMOVED
				<ul style="padding-left:15px">
					<li>XYZ</li>
				</ul>
			</li>
			<li>METHODS: MODIFIED
				<ul style="padding-left:15px">
					<li>XYZ
					<ul style="padding-left:15px">
						<li>Previous Signature: <i>XYZ(str)</i></li>
						<li>New Signature: <i>XYZ(str, str)</i></li>
					</ul>
					</li>
				</ul>
			</li>
		</ul>
		</div>
	</li>
	</ul>
		 */
		
		return	buf.toString();
	}

}
