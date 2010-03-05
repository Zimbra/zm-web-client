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
public	class	ModifiedJsClass {

	private	String	name;
	private	String	fullName;
	private	List<JsClass.Property>	addedProperties = new LinkedList();
	private	List<JsClass.Property>	removedProperties = new LinkedList();
	private	List<JsClass.Method>	addedMethods = new LinkedList();
	private	List<JsClass.Method>	removedMethods = new LinkedList();
	private	List<ChangedJsMethod>		changedMethods = new LinkedList();
	
	/**
	 * Constructor.
	 * 
	 */
	public	ModifiedJsClass(String name, String fullName) {
		this.name = name;
		this.fullName = fullName;
	}
	
	/**
	 * Gets the name.
	 * 
	 * @return	the name
	 */
	public	String	getName() {
		return	this.name;
	}

	/**
	 * Gets the full name.
	 * 
	 * @return	the full name
	 */
	public	String	getFullName() {
		return	this.fullName;
	}

	/**
	 * Sets the added properties.
	 * 
	 * @param	addedProperties		the added properties
	 */
	public	void	setAddedProperties(List addedProperties) {
		this.addedProperties = addedProperties;
	}

	/**
	 * Sets the removed properties.
	 * 
	 * @param	removedProperties		the removed properties
	 */
	public	void	setRemovedProperties(List removedProperties) {
		this.removedProperties = removedProperties;
	}

	/**
	 * Gets the added properties.
	 * 
	 * @return	the added properties
	 */
	public	List<JsClass.Property>	getAddedProperties() {
		
		return	Collections.unmodifiableList(this.addedProperties);
	}

	/**
	 * Gets the removed properties.
	 * 
	 * @return	the removed properties
	 */
	public	List<JsClass.Property>	getRemovedProperties() {
		
		return	Collections.unmodifiableList(this.removedProperties);
	}

	/**
	 * Gets the added methods.
	 * 
	 * @return	the added methods
	 */
	public	List<JsClass.Method>	getAddedMethods() {
		
		return	Collections.unmodifiableList(this.addedMethods);
	}

	/**
	 * Gets the removed methods.
	 * 
	 * @return	the removed methods
	 */
	public	List<JsClass.Method>	getRemovedMethods() {
		
		return	Collections.unmodifiableList(this.removedMethods);
	}

	/**
	 * Sets the added methods.
	 * 
	 * @param	addedMethods		the added methods
	 */
	public	void	setAddedMethods(List addedMethods) {
		this.addedMethods = addedMethods;
	}

	/**
	 * Sets the removed methods.
	 * 
	 * @param	removedMethods		the removed methods
	 */
	public	void	setRemovedMethods(List removedMethods) {
		this.removedMethods = removedMethods;
	}

	/**
	 * Gets the changed methods.
	 * 
	 * @return	the changed methods
	 */
	public	List<ChangedJsMethod>	getChangedMethods() {
		
		return	Collections.unmodifiableList(this.changedMethods);
	}

	/**
	 * Adds the changed method.
	 * 
	 * @param	name		the method name
	 * @param	newSignature	the signature
	 * @param	prevSignature	the previous signature
	 */
	public	void	addChangedMethod(String name, String newSignature, String prevSignature) {
		
		ChangedJsMethod m = new ChangedJsMethod(name, newSignature, prevSignature);
		changedMethods.add(m);
	}

	/**
	 * Checks if this class is modified.
	 * 
	 * @return	<code>true</code> if this class is modified
	 */
	public	boolean	isModified() {
		if (getAddedProperties().size() > 0)
			return	true;
		if (getRemovedProperties().size() > 0)
			return	true;
		if (getAddedMethods().size() > 0)
			return	true;
		if (getRemovedMethods().size() > 0)
			return	true;
		if (getChangedMethods().size() > 0)
			return	true;
		
		return	false;
	}
	
	/**
	 * 
	 * @author sposetti
	 *
	 */
	public	class		ChangedJsMethod {
		
		private	String	name;
		private	String	newSignature;
		private	String	prevSignature;
		
		/**
		 * Constructor.
		 * 
		 */
		public	ChangedJsMethod(String name, String newSignature, String prevSignature) {
			this.name = name;
			this.newSignature = newSignature;
			this.prevSignature = prevSignature;
		}
		
		/**
		 * Gets the method name.
		 * 
		 * @return	the method name
		 */
		public	String	getName() {
			return	this.name;
		}

		/**
		 * Gets the new signature.
		 * 
		 * @return	the new signature
		 */
		public	String	getNewSignature() {
			return	this.newSignature;
		}

		/**
		 * Gets the previous signature.
		 * 
		 * @return	the previous signature
		 */
		public	String	getPreviousSignature() {
			return	this.prevSignature;
		}

	} // end inner ModifiedJsMethod class

}