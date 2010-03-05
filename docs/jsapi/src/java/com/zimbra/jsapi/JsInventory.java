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
public	class	JsInventory {

	private	static	final	String			FILE_MANIFEST = "manifest.json";
	private	static	final	String			FILE_INDEX = "index.json";
	
	static	final	String		KEY_ADDED = "ADDED";
	static	final	String		KEY_REMOVED = "REMOVED";

	private	String	buildVersion;
	private	String	buildRelease;
	private	String	buildDate;
	private	List<JsClass>		classes = Collections.synchronizedList(new LinkedList());
	
	/**
	 * Constructor.
	 * 
	 * @param	buildVersion		the build version
	 * @param	buildRelease		the build release
	 * @param	buildDate		the build date
	 */
	private	JsInventory(String buildVersion, String buildRelease, String buildDate) {
		buildVersion = getMajorVersion(buildVersion);
		this.buildVersion = buildVersion;
		this.buildRelease = buildRelease;
		this.buildDate = buildDate;
	}
	
	/**
	 * Gets the major version component (for example, "6.05") of the build version.
	 * 
	 * @param	version		the version
	 * @return	the major version component
	 */
	private	static	String	getMajorVersion(String version) {
		if (version != null) {
			String[] tokens = version.split("\\_");
			if (tokens != null && tokens.length > 0)
				return	tokens[0];
		}
		
		return	version;
	}

	/**
	 * Creates the inventory.
	 * 
	 * @param	investoryFile	the location of the inventory ZIP file
	 * @return	the newly created inventory
	 */
	public	static	JsInventory	create(String inventoryFile)
	throws IOException, JSONException {
	
		ZipFile zipFile = new ZipFile(inventoryFile);

		// read inventory manifest
		JsInventory inventory = initialize(zipFile);

		// load the classes
		inventory.loadClasses(zipFile);

		// load the class definitions
		inventory.loadClassDefinitions(zipFile);

		return	inventory;
	}
	
	/**
	 * Loads the classes list for into the inventory.
	 * 
	 * @param	inventory		the inventory
	 * @param	zipFile			the inventory bundle to read
	 * @return	the inventory
	 */
	private	static	JsInventory	initialize(ZipFile zipFile) 
	throws IOException, JSONException {
		
		ZipEntry	manifestFileEntry = zipFile.getEntry(FILE_MANIFEST);
		
		String 	entryStr = readEntryAsString(zipFile, manifestFileEntry);

		JSONObject jsonObj = new JSONObject(entryStr);
		String buildVersion = jsonObj.getString("build.version");
		String buildDate = jsonObj.getString("build.date");
		String buildRelease = jsonObj.getString("build.release");

		return	new JsInventory(buildVersion, buildRelease, buildDate);
	}

	/**
	 * Loads the classes list for into the inventory.
	 * 
	 * @param	zipFile			the inventory bundle to read
	 */
	private		void	loadClasses(ZipFile zipFile) 
	throws IOException, JSONException {
		
		// read the index file for the class list
		ZipEntry	classesFileEntry = zipFile.getEntry(FILE_INDEX);
		
		String 	entryStr = readEntryAsString(zipFile, classesFileEntry);
		
		// read the JSON information for class info
		JSONObject jsonObj = new JSONObject(entryStr);
		JSONArray classes = jsonObj.getJSONArray("classes");
		for (int i=0; i < classes.length(); i++) {
			JSONObject obj = (JSONObject)classes.get(i);
			String link = obj.getString("link");
			String className = obj.getString("className");
			String packageName = obj.getString("package");
			
			addClass(className, packageName, link);
		}
		
	}
	
	/**
	 * Loads the classes list for into the inventory.
	 * 
	 * @param	zipFile			the inventory bundle to read
	 */
	private		void	loadClassDefinitions(ZipFile zipFile)
	throws IOException, JSONException {
		
		Collection classes = getClasses();
		Iterator it = classes.iterator();
		while (it.hasNext()) {
			JsClass clazz = (JsClass)it.next();

			ZipEntry	classFileEntry = zipFile.getEntry(clazz.getLink());

			String 	entryStr = readEntryAsString(zipFile, classFileEntry);

			JSONObject jsonObj = new JSONObject(entryStr);

			// read the JSON information for constructor info
			JSONObject constrObj = (JSONObject)jsonObj.getJSONObject("constructor");
			try {
				boolean isPrivateConstructor = constrObj.getBoolean("isPrivate");
				boolean isInnerConstructor = constrObj.getBoolean("isInner");
				String signatureConstructor = constrObj.getString("signature");
				clazz.setConstructor(signatureConstructor, isPrivateConstructor, isInnerConstructor);
			} catch (JSONException je) {
				// ignore...some class don't have a constructor
			}

			// read the JSON information for methods info
			JSONArray methods = jsonObj.getJSONArray("methods");
			for (int i=0; i < methods.length(); i++) {
				JSONObject obj = (JSONObject)methods.get(i);

				String name = obj.getString("name");
				String signature = obj.getString("signature");
				boolean isPrivate = obj.getBoolean("isPrivate");
				boolean isInner = obj.getBoolean("isInner");
				boolean isStatic = obj.getBoolean("isStatic");
				
				clazz.addMethod(name, signature, isPrivate, isInner, isStatic);
			}

			// read the JSON information for properties info
			JSONArray properties = jsonObj.getJSONArray("properties");
			for (int i=0; i < properties.length(); i++) {
				JSONObject obj = (JSONObject)properties.get(i);

				String name = obj.getString("name");
				boolean isPrivate = obj.getBoolean("isPrivate");
				boolean isInner = obj.getBoolean("isInner");
				boolean isStatic = obj.getBoolean("isStatic");
				
				clazz.addProperty(name, isPrivate, isInner, isStatic);
			}

		}
	}

	/**
	 * Reads the entry as a string.
	 * 
	 * @param	zipFile		the zip file
	 * @param	entry		the zip entry to read
	 * @return	the string
	 */
	private	static	String	readEntryAsString(ZipFile zipFile, ZipEntry zipEntry)
	throws IOException {
		StringBuffer sb = new StringBuffer();
	
		InputStream is = zipFile.getInputStream(zipEntry);
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
	 * Gets the inventory build version.
	 * 
	 * @return	the inventory build version
	 */
	public	String	getBuildVersion() {
		return	this.buildVersion;
	}

	/**
	 * Gets the inventory build release.
	 * 
	 * @return	the inventory build release
	 */
	public	String	getBuildRelease() {
		return	this.buildRelease;
	}

	/**
	 * Gets the inventory build date.
	 * 
	 * @return	the inventory build date
	 */
	public	String	getBuildDate() {
		return	this.buildDate;
	}

	/**
	 * Adds the class to the inventory.
	 * 
	 * @param	className		the class name
	 * @param	packageName		the package name
	 * @param	link			the link to the class JSON definition
	 * @return	the newly added class
	 */
	private	JsClass		addClass(String className, String packageName, String link) {
		JsClass clazz = new JsClass(className, packageName, link);
		
		this.classes.add(clazz);
		
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
	 * @return	a list of {@link JsClass} objects
	 */
	public	List<JsClass>		getClasses() {
		return	new LinkedList(this.classes);
	}

	/**
	 * Generates an inventory difference.
	 * 
	 * @param	inv		the inventory to compare against
	 * @return	the change log data model
	 */
	public	Map		generateChangeLogDataModel(JsInventory inv) {
	
		Map	root = new HashMap();
		
		root.put("baseline", this);
		root.put("comparison", inv);

		Map<String,JsClass>	diffClasses = this.generateDiffClassList(this, inv);
       	List<JsClass> addedClasses = (List<JsClass>)diffClasses.get(KEY_ADDED);
       	List<JsClass> removedClasses = (List<JsClass>)diffClasses.get(KEY_REMOVED);

		root.put("addedClasses", addedClasses);
		root.put("removedClasses", removedClasses);

       	List<ModifiedJsClass> modifiedClasses = generateModifiedClassList(this, inv);

		root.put("modifiedClasses", modifiedClasses);

		return	root;
		}
	
	/**
	 * Generates a map of added and removed class differences between the two inventories.
	 * 
	 * @param	prevInventory		the previous inventory
	 * @param	currentInventory		the current inventory
	 * @return	a map of added and removed classes
	 */
	private	static	Map	generateDiffClassList(JsInventory previousInventory, JsInventory currentInventory) {
		Collection<JsClass> currentClasses = currentInventory.getClasses();
		Collection<JsClass> previousClasses = previousInventory.getClasses();
		return	generateDiffList(previousClasses, currentClasses);
	}

	/**
	 * Generates a class difference list.
	 * 
	 */
	private	static	Map<String,Object>	generateDiffList(Collection prevList, Collection curList) {
		List removedList = new LinkedList();

		Iterator it = prevList.iterator();
		while (it.hasNext()) {
			Object obj = it.next();
			
			if (curList.contains(obj))
				curList.remove(obj);
			else
				removedList.add(obj);
		}
			
		HashMap diffList = new HashMap();
				
		diffList.put (KEY_ADDED, curList); // added
		diffList.put (KEY_REMOVED, removedList); // removed
		
		return	diffList;
	}
		
	/**
	 * Generates a list of modified class differences between the two inventories.
	 * 
	 * @param	prevInventory		the previous inventory
	 * @param	currentInventory		the current inventory
	 * @return	a list of modified classes
	 */
	private	static	List<ModifiedJsClass>	generateModifiedClassList(JsInventory previousInventory, JsInventory currentInventory) {
		LinkedList modifiedClasses = new LinkedList();
		
		List<JsClass> currentClasses = currentInventory.getClasses();
		List<JsClass> previousClasses = previousInventory.getClasses();

		// only check for modification of previously existing classes
		currentClasses.retainAll(previousClasses);

		Iterator it = currentClasses.iterator();
		while (it.hasNext()) {
			JsClass clazz = (JsClass)it.next();

			int index = previousClasses.indexOf(clazz);
			JsClass prevClazz = (JsClass)previousClasses.get(index);

			// generate diff property list
			List<JsClass.Property> currentProperties = clazz.getProperties();
			List<JsClass.Property> previousProperties = prevClazz.getProperties();
			Map modifiedProperties = generateDiffList(previousProperties, currentProperties);

			// generate diff method list
			List<JsClass.Method> currentMethods = clazz.getMethods();
			List<JsClass.Method> previousMethods = prevClazz.getMethods();
			Map modifiedMethods = generateDiffList(previousMethods, currentMethods);

			ModifiedJsClass mod = new ModifiedJsClass(clazz.getName(), clazz.getFullName());

			List<JsClass.Property>	addedProperties = (List)modifiedProperties.get(KEY_ADDED);
			List<JsClass.Property>	removedProperties = (List)modifiedProperties.get(KEY_REMOVED);
			mod.setAddedProperties(addedProperties);
			mod.setRemovedProperties(removedProperties);

			List<JsClass.Method>	addedMethods = (List)modifiedMethods.get(KEY_ADDED);
			List<JsClass.Method>	removedMethods = (List)modifiedMethods.get(KEY_REMOVED);
			mod.setAddedMethods(addedMethods);
			mod.setRemovedMethods(removedMethods);

			// only check for modification of previously existing methods
			currentMethods = clazz.getMethods();
			previousMethods = prevClazz.getMethods();
			currentMethods.retainAll(previousMethods);

			// generate changed methods
			Iterator itt = currentMethods.iterator();
			while (itt.hasNext()) {
				JsClass.Method meth = (JsClass.Method)itt.next();
				
				int midx = previousMethods.indexOf(meth);
				JsClass.Method prevMeth = (JsClass.Method)previousMethods.get(midx);
				
				if (meth.isChanged(prevMeth))
					mod.addChangedMethod(meth.getName(), meth.getSignature(), prevMeth.getSignature());
			}
			
			if (mod.isModified())
				modifiedClasses.add(mod);
		}
		
		return	modifiedClasses;
	}

	/**
	 * Dumps the inventory to <code>System.out</code>
	 * 
	 */
	public	void	dump() {
		StringBuffer buf = new StringBuffer();
	
		buf.append("Inventory: ");
		buf.append("\n");
		buf.append("  Version: ");
		buf.append(getBuildVersion());
		buf.append("\n");
		buf.append("  Date: ");
		buf.append(getBuildDate());
		buf.append("\n");
		buf.append("  Release: ");
		buf.append(getBuildRelease());
		buf.append("\n");
		buf.append("Classes (");
		buf.append(getClassCount());
		buf.append("): ");
		buf.append("\n");
		
		Iterator it = this.classes.iterator();
		while (it.hasNext()) {
			JsClass clazz = (JsClass)it.next();
			buf.append("    Class: ");
			buf.append(clazz.getName());
			buf.append(" (");
			buf.append(clazz.getFullName());
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
		buf.append(";build.version=");
		buf.append(getBuildVersion());
		buf.append(";build.date=");
		buf.append(getBuildDate());
		buf.append(";build.release=");
		buf.append(getBuildRelease());
		buf.append(";hashCode=");
		buf.append(hashCode());
		buf.append(";classCount=");
		buf.append(getClassCount());
		buf.append("]");
		
		return	buf.toString();
	}

} // end Inventory class