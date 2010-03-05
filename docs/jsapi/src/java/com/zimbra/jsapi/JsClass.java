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
public	class	JsClass {

	private	String	name;
	private	String	fullName;
	private	String	link;
	
	private	Method	constructorMethod = null;
	private	List	methods = new LinkedList();
	private	List	properties = new LinkedList();

	/**
	 * Constructor.
	 * 
	 * @param	name		the class name
	 * @param	fullName	the full name
	 * @param	link		the link
	 */
	public	JsClass(String name, String fullName, String link) {
		
		this.name = name;
		this.fullName = fullName;
		this.link = link;
		
	}
	
	/**
	 * Gets the class name.
	 * 
	 * @return	the class name
	 */
	public	String	getName() {
		return	this.name;
	}

	/**
	 * Gets the class full name.
	 * 
	 * @return	the class full name
	 */
	public	String	getFullName() {
		return	this.fullName;
	}

	/**
	 * Gets the link.
	 * 
	 * @return	the link
	 */
	public	String	getLink() {
		return	this.link;
	}

	/**
	 * Adds the property to the class.
	 * 
	 * @param	name		the property name
	 * @return	the newly added property
	 */
	public	Property	addProperty(String name, boolean isPrivate, boolean isInner, boolean isStatic) {
		
		Property p = new Property(name, isPrivate, isInner, isStatic);
		
		this.properties.add(p);
		
		return	p;
	}

	/**
	 * Adds the method to the class.
	 * 
	 * @param	name		the method name
	 * @return	the newly added method
	 */
	public	Method	addMethod(String name, String signature, boolean isPrivate, boolean isInner, boolean isStatic) {
		
		Method m = new Method(name, signature, isPrivate, isInner, isStatic);
		
		this.methods.add(m);
		
		return	m;
	}

	/**
	 * Sets the constructor for the class.
	 * 
	 * @return	the constructor
	 */
	public	Method	setConstructor(String signature, boolean isPrivate, boolean isInner) {
		
		Method m = new Method(null, signature, isPrivate, isInner, false);
		
		this.constructorMethod = m;
		
		return	m;
	}

	/**
	 * Gets the constructor.
	 * 
	 * @return	the constructor
	 */
	public	Method	getConstructor() {
		return	this.constructorMethod;
	}
	/**
	 * Gets the method count.
	 * 
	 * @return	the method count
	 */
	public	int	getMethodCount() {
		return	this.methods.size();
	}

	/**
	 * Gets the property count.
	 * 
	 * @return	the property count
	 */
	public	int	getPropertyCount() {
		return	this.properties.size();
	}

	/**
	 * Gets the methods.
	 * 
	 * @return	a collection of {@link Method} objects
	 */
	public	List<Method>		getMethods() {		
		return	new LinkedList(this.methods);
	}

	/**
	 * Gets the properties.
	 * 
	 * @return	a collection of {@link Property} objects
	 */
	public	List<Property>		getProperties() {
		return	new LinkedList(this.properties);
	}

	/**
	 * Compares the object.
	 * 
	 */
	public	boolean	equals(Object obj) {
		if (obj instanceof JsClass) {
			JsClass clazz = (JsClass)obj;
			String testName = clazz.getName();
			return	this.getName().equals(testName);
		}
		
		return false;
	}

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return	a string representation of the object
	 */
	public	String	toString() {
		StringBuffer buf = new StringBuffer();
		
		buf.append("[jsclass");
		buf.append(";name=");
		buf.append(getName());
		buf.append(";fullName=");
		buf.append(getFullName());
		buf.append(";link=");
		buf.append(getLink());
		buf.append(";hashCode=");
		buf.append(hashCode());
		buf.append(";methodCount=");
		buf.append(getMethodCount());
		buf.append(";propertyCount=");
		buf.append(getPropertyCount());
		buf.append("]");
		
		return	buf.toString();
	}

	/**
	 * 
	 * @author sposetti
	 *
	 */
	public	static	class	Property {

		private	String	name = null;
		private	boolean	isPrivate = false;
		private	boolean	isInner = false;
		private	boolean	isStatic = false;

		/**
		 * Constructor.
		 * 
		 */
		public	Property(String name, boolean isPrivate, boolean isInner, boolean isStatic) {
			this.name = name;
			this.isPrivate = isPrivate;
			this.isInner = isInner;
			this.isStatic = isStatic;
		}
	
		/**
		 * Gets the name
		 * 
		 * @return	the name
		 */
		public	String	getName() {
			return	this.name;
		}
		
		/**
		 * Compares the object.
		 * 
		 */
		public	boolean	equals(Object obj) {
			if (obj instanceof Property) {
				Property prop = (Property)obj;
				String testName = prop.getName();
				return	this.getName().equals(testName);
			}
			
			return false;
		}

	} // end inner Property class

	/**
	 * 
	 * @author sposetti
	 *
	 */
	public	static	class	Method extends Property {

		private	String	signature = null;

		/**
		 * Constructor.
		 * 
		 */
		public	Method(String name, String signature, boolean isPrivate, boolean isInner, boolean isStatic) {
			super(name, isPrivate, isInner, isStatic);
			this.signature = signature;
		}
		
		/**
		 * Gets the signature.
		 * 
		 * @return	the signature
		 */
		public	String	getSignature() {
			return	this.signature;
		}
	
		/**
		 * Checks if the method is changed by comparing signatures.
		 */
		public	boolean	isChanged(Method method) {
			if (getName().equals(method.getName()) == false)
				return	false;

			String	compSig = method.getSignature();

			if (getSignature().equals(compSig) == false)
				return	true;
			
			return	false;
		}
		
	} // end inner Method class
	
} // end Inventory class