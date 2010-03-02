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
	
	private	static	final	String		ARG_WORKING_DIR = "-wd";
	private	static	final	String		ARG_DELIVERY_DIR = "-dd";
	private	static	final	String		ARG_PREVIOUS_INVENTORY = "-pi";
	private	static	final	String		ARG_CURRENT_INVENTORY = "-ci";
	private	static	final	String		ARG_PREVIOUS_LABEL = "-pl";
	private	static	final	String		ARG_CURRENT_LABEL = "-cl";

	private	static	String	workingDirectory = null;
	private	static	String	deliveryDirectory = null;
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
		
		if (args[argPos].equals(ARG_WORKING_DIR)) {
			workingDirectory = args[++argPos];
			argPos++;
		}

		if (args[argPos].equals(ARG_DELIVERY_DIR)) {
			deliveryDirectory = args[++argPos];
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
			
			inventory.addClass(className, link);
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
			System.out.println(constrObj);
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
    	
    	for (int i=0; i < args.length; i++)
    		System.out.println(args[i]);
    	
       	readArguments(args);
       	
       	Inventory prevInventory = readInventory(previousLabel, previousInventory);
       	Inventory currInventory = readInventory(currentLabel, currentInventory);
       	
       	prevInventory.dump();
       	currInventory.dump();
    }
}