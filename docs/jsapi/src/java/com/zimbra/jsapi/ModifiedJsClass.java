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
	private	String	packageName;
	private	Map		modifiedProperties = new HashMap();
	private	Map		modifiedMethods = new HashMap();
	private	List	changedMethods = new LinkedList();
	
	/**
	 * Constructor.
	 * 
	 */
	public	ModifiedJsClass(String name, String packageName) {
		this.name = name;
		this.packageName = packageName;
	}
	
	/**
	 * Gets the package name.
	 * 
	 * @return	the package name
	 */
	public	String	getPackageName() {
		return	this.packageName;
	}
	
	/**
	 * Sets the modified properties.
	 * 
	 * @param	modifiedProperties		the modified properties
	 */
	public	void	setModifiedProperties(Map modifiedProperties) {
		this.modifiedProperties = modifiedProperties;
	}

	/**
	 * Gets the added properties.
	 * 
	 * @return	the added properties
	 */
	public	List	getAddedProperties() {
		
		return	(List)this.modifiedProperties.get(ZmChangeLogUtil.KEY_ADDED);
	}

	/**
	 * Gets the removed properties.
	 * 
	 * @return	the removed properties
	 */
	public	List	getRemovedProperties() {
		
		return	(List)this.modifiedProperties.get(ZmChangeLogUtil.KEY_REMOVED);
	}

	/**
	 * Gets the changed methods.
	 * 
	 * @return	the changed methods
	 */
	public	List	getChangedMethods() {
		
		return	new LinkedList(this.changedMethods);
	}

	/**
	 * Gets the added methods.
	 * 
	 * @return	the added methods
	 */
	public	List	getAddedMethods() {
		
		return	(List)this.modifiedMethods.get(ZmChangeLogUtil.KEY_ADDED);
	}

	/**
	 * Gets the removed methods.
	 * 
	 * @return	the removed methods
	 */
	public	List	getRemovedMethods() {
		
		return	(List)this.modifiedMethods.get(ZmChangeLogUtil.KEY_REMOVED);
	}

	/**
	 * Sets the modified methods.
	 * 
	 * @param	modifiedMethods		the modified methods
	 */
	public	void	setModifiedMethods(Map modifiedMethods) {
		this.modifiedMethods = modifiedMethods;
	}

	/**
	 * Adds the changed method.
	 * 
	 * @param	name		the method name
	 * @param	newSignature	the signature
	 * @param	prevSignature	the previous signature
	 */
	public	void	addChangedMethod(String name, String newSignature, String prevSignature) {
		
		ModifiedMethod m = new ModifiedMethod(name, newSignature, prevSignature);
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
		if (this.changedMethods.size() > 0)
			return	true;
		
		return	false;
	}
	
	/**
	 * 
	 * @author sposetti
	 *
	 */
	public	class		ModifiedMethod {
		
		private	String	name;
		private	String	newSignature;
		private	String	prevSignature;
		
		/**
		 * Constructor.
		 * 
		 */
		public	ModifiedMethod(String name, String newSignature, String prevSignature) {
			this.name = name;
			this.newSignature = newSignature;
			this.prevSignature = prevSignature;
		}
		
		/**
		 * 
		 */
		public	String	getName() {
			return	this.name;
		}

		/**
		 * 
		 */
		public	String	getNewSignature() {
			return	this.newSignature;
		}

		/**
		 * 
		 */
		public	String	getPreviousSignature() {
			return	this.prevSignature;
		}

	} // end inner ModifiedMethod class

}