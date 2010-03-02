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
	private	String	link;
	
	private	Method	constructorMethod = null;
	private	Map		methods = Collections.synchronizedMap(new HashMap());
	private	Map		properties = Collections.synchronizedMap(new HashMap());

	/**
	 * Constructor.
	 * 
	 * @param	label		the label
	 */
	public	JsClass(String name, String link) {
		
		this.name = name;	
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
		
		this.properties.put(name, p);
		
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
		
		this.methods.put(name, m);
		
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
	public	Collection<Method>		getMethods() {
		Collection c = this.methods.values();
		
		return	Collections.unmodifiableCollection(c);
	}

	/**
	 * Gets the properties.
	 * 
	 * @return	a collection of {@link Property} objects
	 */
	public	Collection<Property>		getProperties() {
		Collection c = this.properties.values();
		
		return	Collections.unmodifiableCollection(c);
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
	
	} // end inner Method class
	
} // end Inventory class