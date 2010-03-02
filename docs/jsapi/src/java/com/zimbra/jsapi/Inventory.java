package	com.zimbra.jsapi;

import java.io.*;
import java.util.*;

/**
 * 
 * @author sposetti
 *
 */
public	class	Inventory {

	private	String	label;
	private	Map		classes = Collections.synchronizedMap(new HashMap());
	
	/**
	 * Constructor.
	 * 
	 * @param	label		the label
	 */
	public	Inventory(String label) {
		
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
	 * @param	link			the link to the class JSON definition
	 * @return	the newly added class
	 */
	public	JsClass		addClass(String className, String link) {
		
		JsClass clazz = new JsClass(className, link);
		
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
	public	Collection<JsClass>		getClasses() {
		Collection c = this.classes.values();
		
		return	Collections.unmodifiableCollection(c);
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