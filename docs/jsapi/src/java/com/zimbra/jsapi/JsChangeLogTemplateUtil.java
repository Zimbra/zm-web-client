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
import freemarker.template.*;
import freemarker.ext.beans.*;

/**
 * 
 * @author sposetti
 *
 */
public	class	JsChangeLogTemplateUtil {
	
	public	static	final	String		PROP_TEMPLATE_DIR = "template.dir";
	public	static	final	String		PROP_OUTPUT_DIR = "output.dir";

	public	static	final	String		PROP_TEMPLATE_FILE = "template.file";
	public	static	final	String		PROP_OUTPUT_FILE = "output.file";
	
	private	static	final	String		DEFAULT_TEMPLATE_FILE = "index.ftl";
	private	static	final	String		DEFAULT_OUTPUT_FILE = "index.html";

	private	Properties	props = new Properties();
	
	private	Template template = null;
	
	private	static	JsChangeLogTemplateUtil	templateUtil = null;
	
	/**
	 * Constructor.
	 * 
	 * @param	props			the configuration properties
	 */
	private	JsChangeLogTemplateUtil(Properties props) 
	throws	IOException {
		this.props = props;
		
		File templateDirFile = new File(getTemplateDir());
		
		Configuration config = new Configuration();
		System.out.println(templateDirFile);
		config.setDirectoryForTemplateLoading(templateDirFile);
		config.setObjectWrapper(new BeansWrapper());
		
		template = config.getTemplate(getTemplateFile());
	}
	
	/**
	 * Gets a singleton instance of the template utility.
	 * 
	 * @param	templateDir		the template directory
	 * @param	outputDir		the output directory
	 * @return	the template utility
	 */
	public	static	synchronized	JsChangeLogTemplateUtil		getInstance(Properties props)
	throws	IOException {
		if (templateUtil == null)
			templateUtil = new JsChangeLogTemplateUtil(props);
		
		return	templateUtil;
	}
	
	/**
	 * Writes the changelog.
	 * 
	 * @param	baselineInv		the baseline inventory
	 * @param	comparisonInv	the comparison inventory
	 * 
	 * @throws	IllegalArgumentException
	 */
	public	void	writeChangeLog(JsInventory baselineInv, JsInventory comparisonInv)
	throws IOException, TemplateException {

		String	outputDir = getOutputDir();
		String	outputFile = getOutputFile();
		
		File	of = new File(outputDir, outputFile);
		
		FileWriter out = new FileWriter(of);
		try {
			writeChangeLog(baselineInv, comparisonInv, out);
		} finally {
			try {
				out.close();
			} catch (Exception e) {
				// clean-up quietly
			}
		}
	}
	
	/**
	 * Writes the changelog.
	 * 
	 * @param	baselineInv		the baseline inventory
	 * @param	comparisonInv	the comparison inventory
	 * @param	out				the output writer
	 * 
	 * @throws	IllegalArgumentException
	 */
	public	void	writeChangeLog(JsInventory baselineInv, JsInventory comparisonInv, Writer out)
	throws IOException, TemplateException {

       	Map	dataModel = baselineInv.generateChangeLogDataModel(comparisonInv);
       	
       	this.template.process(dataModel, out);
	}

	/**
	 * Gets the template file.
	 * 
	 * @return	the template file
	 */
	private	String	getTemplateFile() {
		
		String	templateFile = this.props.getProperty(PROP_TEMPLATE_FILE);
		if (templateFile != null && templateFile.length() > 0)
			return	templateFile;
		
		return	DEFAULT_TEMPLATE_FILE;
	}

	/**
	 * Gets the template directory.
	 * 
	 * @return	the template directory
	 */
	private	String	getTemplateDir() {
		
		String	templateDir = this.props.getProperty(PROP_TEMPLATE_DIR);
		if (templateDir == null || templateDir.length() <= 0)
			throw new IllegalArgumentException("must specify a template directory");

		return	templateDir;
	}

	/**
	 * Gets the output directory.
	 * 
	 * @return	the output directory
	 */
	private	String	getOutputDir() {
		
		String	outputDir = this.props.getProperty(PROP_OUTPUT_DIR);
		if (outputDir == null || outputDir.length() <= 0)
			throw new IllegalArgumentException("must specify an output directory");
		
		return	outputDir;
	}

	/**
	 * Gets the output file.
	 * 
	 * @return	the output file
	 */
	private	String	getOutputFile() {
		
		String	outputFile = this.props.getProperty(PROP_OUTPUT_FILE);
		if (outputFile != null && outputFile.length() > 0)
			return	outputFile;
		
		return	DEFAULT_OUTPUT_FILE;
	}

}
