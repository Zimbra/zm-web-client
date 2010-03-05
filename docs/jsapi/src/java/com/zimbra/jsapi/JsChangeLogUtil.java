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
import java.util.*;
import java.util.zip.*;
import org.json.*;

/**
 * 
 * @author sposetti
 *
 */
public	class	JsChangeLogUtil {
		
	private	static	final	String		ARG_OUTPUT_DIR = "-output";
	private	static	final	String		ARG_TEMPLATE_DIR = "-template";
	private	static	final	String		ARG_BASELINE_INVENTORY = "-baseline.inventory";
	private	static	final	String		ARG_CURRENT_INVENTORY = "-current.inventory";

	private	static	String	outputDir = null;
	private	static	String	templateDir = null;
	private	static	String	baselineInventoryFile = null;
	private	static	String	currentInventoryFile = null;

	/**
	 * Reads the command line arguments.
	 * 
	 * @param	args		the arguments
	 */
	private static void readArguments(String[] args) {
		int	argPos = 0;
		
		if (args[argPos].equals(ARG_OUTPUT_DIR)) {
			outputDir = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_TEMPLATE_DIR)) {
			templateDir = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_BASELINE_INVENTORY)) {
			baselineInventoryFile = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_CURRENT_INVENTORY)) {
			currentInventoryFile = args[++argPos];
			argPos++;
		}

	}
		
	/**
	 * Main
	 * 
	 * @param	args		the utility arguments
	 */
    public static void main(String[] args) throws Exception {
    	
       	readArguments(args);
       	
       	JsInventory baselineInv = JsInventory.create(baselineInventoryFile);
       	JsInventory currentInv = JsInventory.create(currentInventoryFile);

       	Properties props = new Properties();
       	props.setProperty(JsChangeLogTemplateUtil.PROP_TEMPLATE_DIR, templateDir);
       	props.setProperty(JsChangeLogTemplateUtil.PROP_OUTPUT_DIR, outputDir);

       	JsChangeLogTemplateUtil templateUtil = JsChangeLogTemplateUtil.getInstance(props);
       	templateUtil.writeChangeLog(baselineInv, currentInv);
    }

}