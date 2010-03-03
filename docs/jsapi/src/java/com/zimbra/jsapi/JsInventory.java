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

/**
 * 
 * @author sposetti
 *
 */
public	class	JsInventory {

	private	String	label;
	private	Map		classes = Collections.synchronizedMap(new HashMap());
	
	/**
	 * Constructor.
	 * 
	 * @param	label		the label
	 */
	public	JsInventory(String label) {
		
		this.label = label;	
	}
	
	/**
	 * Gets the inventory label.
	 * 
	 * @return	the inventory label
	 */
	public	String	getLabel() {
		return	this.label;
	}
	
	/**
	 * Adds the class to the inventory.
	 * 
	 * @param	className		the class name
	 * @param	packageName		the package name
	 * @param	link			the link to the class JSON definition
	 * @return	the newly added class
	 */
	public	JsClass		addClass(String className, String packageName, String link) {
		
		JsClass clazz = new JsClass(className, packageName, link);
		
		this.classes.put(className, clazz);
		
		return	clazz;
	}
	
	/**
	 * Gets the class count.
	 * 
	 * @return	the class count
	 */
	public	int	getClassCount() {
		return	this.classes.size();
	}

	/**
	 * Gets the classes.
	 * 
	 * @return	the classes
	 */
	public	List<JsClass>		getClasses() {
		Collection c = this.classes.values();
		
		return	new LinkedList(c);
	}

	public	void	dump() {
		StringBuffer buf = new StringBuffer();
	
		buf.append("Inventory: ");
		buf.append(getLabel());
		buf.append("\n");
		buf.append("Classes (");
		buf.append(getClassCount());
		buf.append("): ");
		buf.append("\n");
		
		Iterator it = this.classes.values().iterator();
		while (it.hasNext()) {
			JsClass clazz = (JsClass)it.next();
			buf.append("    Class: ");
			buf.append(clazz.getName());
			buf.append(" (");
			buf.append(clazz.getPackage());
			buf.append(")");
			buf.append("\n");
			
			JsClass.Method constructorMethod = clazz.getConstructor();
			buf.append("        Constructor: ");
			if (constructorMethod != null)
				buf.append(constructorMethod.getSignature());
			buf.append("\n");

			Iterator pit = clazz.getProperties().iterator();
			while (pit.hasNext()) {
				JsClass.Property prop = (JsClass.Property)pit.next();
				buf.append("        Property: ");
				buf.append(prop.getName());
				buf.append("\n");
			}

			Iterator mit = clazz.getMethods().iterator();
			while (mit.hasNext()) {
				JsClass.Method method = (JsClass.Method)mit.next();
				buf.append("        Method: ");
				buf.append(method.getName());
				buf.append(" ");
				buf.append(method.getSignature());
				buf.append("\n");
			}
		}
		
		System.out.println(buf.toString());
	}
	
	/**
	 * Returns a string representation of the object.
	 * 
	 * @return	a string representation of the object
	 */
	public	String	toString() {
		StringBuffer buf = new StringBuffer();
		
		buf.append("[inventory");
		buf.append(";label=");
		buf.append(getLabel());
		buf.append(";hashCode=");
		buf.append(hashCode());
		buf.append(";classCount=");
		buf.append(getClassCount());
		buf.append("]");
		
		return	buf.toString();
	}

} // end Inventory class