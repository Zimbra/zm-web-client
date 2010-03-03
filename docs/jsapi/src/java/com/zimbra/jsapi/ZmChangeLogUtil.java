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
public	class	ZmChangeLogUtil {
	
	public	static	final	String		KEY_ADDED = "ADDED";
	public	static	final	String		KEY_REMOVED = "REMOVED";
	
	private	static	final	String		ARG_DELIVERY_DIR = "-delivery";
	private	static	final	String		ARG_TEMPLATE_DIR = "-template";
	private	static	final	String		ARG_PREVIOUS_INVENTORY = "-pi";
	private	static	final	String		ARG_CURRENT_INVENTORY = "-ci";
	private	static	final	String		ARG_PREVIOUS_LABEL = "-pl";
	private	static	final	String		ARG_CURRENT_LABEL = "-cl";

	private	static	String	deliveryDirectory = null;
	private	static	String	templateDirectory = null;
	private	static	String	previousInventory = null;
	private	static	String	currentInventory = null;
	private	static	String	previousLabel = null;
	private	static	String	currentLabel = null;

	/**
	 * Reads the command line arguments.
	 * 
	 * @param	args		the arguments
	 */
	private static void readArguments(String[] args) {
		int	argPos = 0;
		
		if (args[argPos].equals(ARG_DELIVERY_DIR)) {
			deliveryDirectory = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_TEMPLATE_DIR)) {
			templateDirectory = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_PREVIOUS_INVENTORY)) {
			previousInventory = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_CURRENT_INVENTORY)) {
			currentInventory = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_PREVIOUS_LABEL)) {
			previousLabel = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_CURRENT_LABEL)) {
			currentLabel = args[++argPos];
			argPos++;
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
	 * Loads the classes list for into the inventory.
	 * 
	 * @param	inventory		the inventory
	 * @param	zipFile			the inventory bundle to read
	 * @return	the inventory
	 */
	private	static	Inventory	loadClasses(Inventory inventory, ZipFile zipFile) 
	throws IOException, JSONException {
		
		// read the index file for the class list
		ZipEntry	classesFileEntry = zipFile.getEntry("index.html");
		
		String 	entryStr = readEntryAsString(zipFile, classesFileEntry);
		
		// read the JSON information for class info
		JSONObject jsonObj = new JSONObject(entryStr);
		JSONArray classes = jsonObj.getJSONArray("classes");
		for (int i=0; i < classes.length(); i++) {
			JSONObject obj = (JSONObject)classes.get(i);
			String link = obj.getString("link");
			String className = obj.getString("className");
			String packageName = obj.getString("package");
			
			inventory.addClass(className, packageName, link);
		}
		
		return	inventory;		
	}
	
	/**
	 * Loads the classes list for into the inventory.
	 * 
	 * @param	inventory		the inventory
	 * @param	zipFile			the inventory bundle to read
	 * @return	the inventory
	 */
	private	static	Inventory	loadClassDefinitions(Inventory inventory, ZipFile zipFile)
	throws IOException, JSONException {
		
		Collection classes = inventory.getClasses();
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
		
		return	inventory;		
	}
	
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
	 * Generates a map of added and removed class differences between the two inventories.
	 * 
	 * @param	prevInventory		the previous inventory
	 * @param	currentInventory		the current inventory
	 * @return	a map of added and removed classes
	 */
	private	static	Map	generateDiffClassList(Inventory previousInventory, Inventory currentInventory) {
		Collection<JsClass> currentClasses = currentInventory.getClasses();
		Collection<JsClass> previousClasses = previousInventory.getClasses();

		return	generateDiffList(previousClasses, currentClasses);
	}
	
	/**
	 * Generates a list of modified class differences between the two inventories.
	 * 
	 * @param	prevInventory		the previous inventory
	 * @param	currentInventory		the current inventory
	 * @return	a list of modified classes
	 */
	private	static	List<ModifiedJsClass>	generateModifiedClassList(Inventory previousInventory, Inventory currentInventory) {
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

			ModifiedJsClass mod = new ModifiedJsClass(clazz.getName(), clazz.getPackage());
			mod.setModifiedProperties(modifiedProperties);
			mod.setModifiedMethods(modifiedMethods);

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
	 * Reads the inventory file.
	 * 
	 * @param	label		the inventory label
	 * @param	investoryFile	the location of the inventory ZIP file
	 * @return	the resulting inventory
	 */
	private	static	Inventory	readInventory(String label, String inventoryFile)
	throws IOException, org.json.JSONException {
		
		Inventory inventory = new Inventory(label);

		ZipFile zipFile = new ZipFile(inventoryFile);

		// load the classes
		inventory = loadClasses(inventory, zipFile);

		// load the class definitions
		inventory = loadClassDefinitions(inventory, zipFile);

		return	inventory;		
	}
		
	/**
	 * Main
	 * 
	 * @param	args
	 */
    public static void main(String[] args) throws Exception {
    	
       	readArguments(args);
       	
       	Inventory prevInventory = readInventory(previousLabel, previousInventory);
       	Inventory currInventory = readInventory(currentLabel, currentInventory);
       	
       	Map	 diffClasses = generateDiffClassList(prevInventory, currInventory);
       	
       	List<JsClass> addedClasses = (List<JsClass>)diffClasses.get(KEY_ADDED);
       	List<JsClass> removedClasses = (List<JsClass>)diffClasses.get(KEY_REMOVED);

       	List<ModifiedJsClass> modifiedClasses = generateModifiedClassList(prevInventory, currInventory);

       	ChangeLogTemplate template = new ChangeLogTemplate(previousLabel, currentLabel, templateDirectory, deliveryDirectory);
       	template.writeTemplate(addedClasses, removedClasses, modifiedClasses);
    }
}