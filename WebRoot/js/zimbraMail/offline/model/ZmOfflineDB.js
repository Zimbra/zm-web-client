var ZmOfflineDB = {};
ZmOfflineDB.indexedDB = {};
ZmOfflineDB.indexedDB.db = null;
ZmOfflineDB.indexedDB.callbackQueue = [];
ZmOfflineDB.indexedDB.initDone = false;
window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
ZmOfflineDB.indexedDB.idxStore = "zmofflineidxstore";


if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

ZmOfflineDB.indexedDB.onerror = function(e) {
    DBG.println(AjxDebug.DBG1, e);
};

ZmOfflineDB.indexedDB.init =
function (callback) {
    ZmOfflineDB.indexedDB.open(callback);
    ZmOfflineDB.indexedDB.openOfflineLogDB();
};

ZmOfflineDB.indexedDB.open = function(callback, version) {
    var createObjectStore = function(){
        var db = ZmOfflineDB.indexedDB.db;
        var stores = ZmOffline.store.concat([ZmOffline.ZmOfflineStore, ZmOfflineDB.indexedDB.idxStore, ZmApp.MAIL, ZmOffline.ATTACHMENT, ZmApp.CONTACTS, ZmApp.CALENDAR, ZmOffline.REQUESTQUEUE]);
        for (var i=0, length=stores.length; i<length;i++){
            if(!db.objectStoreNames.contains(stores[i])) {
                DBG.println(AjxDebug.DBG1, "Creating objectstore : " + stores[i]);
                if (stores[i] === ZmApp.MAIL) {
                    var store = db.createObjectStore(stores[i], {keyPath: "id"});
                    store.createIndex("size", "s");
                    store.createIndex("folder", "l");
                    store.createIndex("receiveddate", "d");
                    store.createIndex("flags", "f", {multiEntry : true});
                    store.createIndex("tag", "tn", {multiEntry : true});
                    store.createIndex("subject", "su", {multiEntry : true});
                    store.createIndex("fragment", "fr", {multiEntry : true});
                    //Email index
                    store.createIndex("from", "e.from");
                    store.createIndex("to", "e.to", {multiEntry : true});
                    store.createIndex("cc", "e.cc", {multiEntry : true});
                }
                else if (stores[i] === ZmApp.CONTACTS) {
                    var store = db.createObjectStore(stores[i], {keyPath: "id"});
                    store.createIndex("folder", "l");
                    store.createIndex("tag", "tn", {multiEntry : true});
                    //Display String
                    store.createIndex("fileasstr", "fileAsStr");
                    //Email index
                    store.createIndex("firstname", "_attrs.firstName");
                    store.createIndex("lastname", "_attrs.lastName");
                    store.createIndex("middlename", "_attrs.middleName");
                    store.createIndex("email", "_attrs.email");
                    store.createIndex("company", "_attrs.company");
                    store.createIndex("jobtitle", "_attrs.jobTitle", {multiEntry : true});
                }
                else if (stores[i] === ZmOffline.ATTACHMENT) {
                    var store = db.createObjectStore(stores[i], {keyPath: "id"});
                     //Attachment Type Index
                    store.createIndex("type", "type");
                    store.createIndex("name", "name");
                    store.createIndex("size", "size");
                    store.createIndex("mid", "mid");
                }
                else if (stores[i] === ZmOffline.REQUESTQUEUE) {
                    var store = db.createObjectStore(stores[i], {keyPath : "oid", autoIncrement : true});
                    //Request queue index
                    store.createIndex("methodname", "methodname");
                    store.createIndex("id", "id");
                    store.createIndex("methodname, id", ["methodname", "id"]);
                } else if (stores[i] === ZmApp.CALENDAR) {
                    // Store ZmAppts, otherwise no start and end date fields.  The rawAppts potentially represent
                    // several appts (base appt info + instance), with differing startDates.  The instanceId is a
                    // generated key field, storing id:startTime (time in msec)
                    var store = db.createObjectStore(stores[i], {keyPath: "instanceId"});
                    // id is non-unique, but if a appt has been exploded into multiple ZmAppt entries, it allows
                    // us to access them for Update/Delete
                    store.createIndex("invId", "invId");
                    store.createIndex("startDate", "startDate");
                    store.createIndex("endDate", "endDate");
                } else {
                    var store = db.createObjectStore(stores[i], {keyPath: "key"});
                }
            }
        }
    };

    try {
        var request = (version) ? indexedDB.open(appCtxt.getLoggedInUsername(), version) : indexedDB.open(appCtxt.getLoggedInUsername());
        request.onerror = ZmOfflineDB.indexedDB.onerror;

        if (callback){
            ZmOfflineDB.indexedDB.callbackQueue.push(callback);
        }

        request.onupgradeneeded = function (e) {
            try{
                ZmOfflineDB.indexedDB.db = e.target.result;
                createObjectStore();
                ZmOfflineDB.indexedDB.runCallBackQueue();
            }catch(ex){
                console.error("Error while creating objectstore");
            }
        };
        request.onsuccess = function(e) {
            var v = 2;
            ZmOfflineDB.indexedDB.db = e.target.result;
            var db = ZmOfflineDB.indexedDB.db;
            if (v != db.version && db.setVersion) {
                var setVrequest = db.setVersion(v);
                setVrequest.onerror = ZmOfflineDB.indexedDB.onerror
                setVrequest.onsuccess = function(e) {
                    createObjectStore();
                    ZmOfflineDB.indexedDB.runCallBackQueue();
                };
            } else {
                DBG.println(AjxDebug.DBG1, "indexedDB is created");
                ZmOfflineDB.indexedDB.db = e.target.result;
                ZmOfflineDB.indexedDB.runCallBackQueue();
                request.oncomplete = function(e) {
                   ZmOfflineDB.indexedDB.db =  ZmOfflineDB.indexedDB.db  || e.target.result
                   DBG.println(AjxDebug.DBG1, "indexedDB.open oncomplete")
                };
                ZmOfflineDB.indexedDB.db =  ZmOfflineDB.indexedDB.db || request.result;
            }
        };
    } catch(ex){
        DBG.println(AjxDebug.DBG1, "Error while opening indexedDB");
    }
};

ZmOfflineDB.indexedDB.addObjectStores =
function(callback){
    ZmOfflineDB.indexedDB.db.close();
    var version = ZmOfflineDB.indexedDB.db.version + 1;
    ZmOfflineDB.indexedDB.open(callback, version);
};

ZmOfflineDB.indexedDB.runCallBackQueue = function(){
    ZmOfflineDB.indexedDB.initDone = true;
    for (var i=0;i<ZmOfflineDB.indexedDB.callbackQueue.length; i++){
        var callback = ZmOfflineDB.indexedDB.callbackQueue[i];
        callback.run();
    }
    ZmOfflineDB.indexedDB.callbackQueue = [];
};

ZmOfflineDB.indexedDB.setItem = function(key, value, objStore) {
    if (!key) return;
    objStore = objStore || ZmOffline.ZmOfflineStore;
    if (!ZmOfflineDB.indexedDB.initDone){
        ZmOfflineDB.indexedDB.pushIntoCallbackQueue(ZmOfflineDB.indexedDB.setItem.bind(this, key, value));
        return;
    }
    try{
        var db = ZmOfflineDB.indexedDB.db;
        var trans = db.transaction([objStore], "readwrite");
        var store = trans.objectStore(objStore);
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.setItem key : " + key);
        var request = store.put({key:key, value:value});
        request.key = key;
        request.value = value;
        request.onsuccess = function(e) {
            ZmOfflineDB.indexedDB.setIndex(key, objStore);
            DBG.println(AjxDebug.DBG1, "Added request and response in indexedDB");
        };
        request.onerror = function(e) {
            DBG.println(AjxDebug.DBG1, "Error while addling request and response in indexedDB" + e);
            //DBG.println(AjxDebug.DBG1, "req.key " + request.key + " req.id "  + request.id + " req.value " + request.value);
        };
    }catch(ex){
        DBG.println(AjxDebug.DBG1, "Exception while addling request and response in indexedDB" + ex);
    }
};


ZmOfflineDB.indexedDB.setIndex = function(idx, storeValue) {
    if (!idx) return;
    objStore = ZmOfflineDB.indexedDB.idxStore;
    var db = ZmOfflineDB.indexedDB.db;
    try{
        var trans = db.transaction([objStore], "readwrite");
        var store = trans.objectStore(objStore);
        var request = store.put({key:idx, value:storeValue});
        request.onsuccess = function(e) {
            DBG.println(AjxDebug.DBG1, "Added index idx: " + idx + " store : " + storeValue);
        };
        request.onerror = function(e) {
            DBG.println(AjxDebug.DBG1, "Error while adding index idx: " + idx + " store : " + storeValue);
        };
    }catch(ex){
        DBG.println(AjxDebug.DBG1, "Exception while adding index idx: " + idx + " store : " + storeValue + "\n Exception : " + ex);
    }
};


ZmOfflineDB.indexedDB.pushIntoCallbackQueue =
function(item){
    ZmOfflineDB.indexedDB.callbackQueue.push(item);
};

ZmOfflineDB.indexedDB.getItem = function(key, callback, params, objStore){
    if (!callback) return;
    objStore = objStore || ZmOffline.ZmOfflineStore;
    if (!ZmOfflineDB.indexedDB.initDone){
        ZmOfflineDB.indexedDB.pushIntoCallbackQueue(ZmOfflineDB.indexedDB.getItem.bind(this, key, callback, params));
        return;
    }
    var db = ZmOfflineDB.indexedDB.db;
    var trans = db.transaction([objStore], "readwrite");
    var store = trans.objectStore(objStore);
    try {
        var request = store.get(key);
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.getItem key : " + key);
        request.onerror = ZmOfflineDB.indexedDB.onerror;
        request.onsuccess = function(evt) {
            var value = request.result && request.result.value;
            if (value && typeof(value) === "string"){
                params.response = JSON.parse(value);
            } else {
                params.response = value;
            }
            params.offlineRequestDone = true;
            callback(params);
        };
    }catch(ex){
        DBG.println(AjxDebug.DBG1, "Exception while getting item from indexed DB");
    }
};

ZmOfflineDB.indexedDB.deteleItem = function(id, objStore, callback){

    if (!objStore){
        return;
    }
    if (!ZmOfflineDB.indexedDB.initDone){
        ZmOfflineDB.indexedDB.pushIntoCallbackQueue(ZmOfflineDB.indexedDB.deleteItem.bind(this, id, objStore));
        return;
    }

    var db = ZmOfflineDB.indexedDB.db;
    var trans = db.transaction([objStore], "readwrite");
    var store = trans.objectStore(objStore);
    try {
        var req = store['delete'](id);
        req.onsuccess = function(evt) {
            DBG.println(AjxDebug.DBG1, "Deleted the messaage : id " + id);
            callback && callback();
        }
    }catch(ex){
        DBG.println(AjxDebug.DBG1, "Exception while deleting item from indexed DB" + ex);
    }
};

ZmOfflineDB.indexedDB.getItemById = function(key, callback){
    if (!key){
        return;
    }
    var objStore = ZmOfflineDB.indexedDB.idxStore;
    var db = ZmOfflineDB.indexedDB.db;
    var trans = db.transaction([objStore], "readwrite");
    var store = trans.objectStore(objStore);
    try {
        var request = store.get(key);
        request.key = key;
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.getItemById key : " + key);
        request.onerror = ZmOfflineDB.indexedDB.onerror;
        request.callback = callback;
        request.onsuccess = function(evt) {
            var storeValue = request.result && request.result.value;
            storeValue && request.callback && request.callback(storeValue);
        };
    }catch(ex){
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.getItemById : Exception while getting key : " + key);
    }
};


ZmOfflineDB.indexedDB.deleteItemById = function(key){
    ZmOfflineDB.indexedDB.getItemById(key, function(store){
        store && ZmOfflineDB.indexedDB.deteleItem(key, store);
        ZmOfflineDB.indexedDB.deteleItem(key, ZmOfflineDB.indexedDB.idxStore);
    });
};


ZmOfflineDB.indexedDB.getAll =
function(objStore, callback, limit){
    var db = ZmOfflineDB.indexedDB.db;
    if (!db) return;
    var trans = db.transaction([objStore], 'readonly');
    var request = trans.objectStore(objStore).openCursor();
    request.items = [];
    request.onsuccess = function(event) {
      var cursor = request.result || event.result;
      if (!cursor) {
        callback(request.items);
        return;
      }
      request.items.push(cursor.value)
      cursor['continue']();
    }
};


ZmOfflineDB.indexedDB.openOfflineLogDB =
function(callback, errorCallback, version) {
    try {
        var request = version ? indexedDB.open("OfflineLog", version) : indexedDB.open("OfflineLog");
        request.onerror = errorCallback;
        request.onsuccess = function() {
            var db = request.result;
            if (db.objectStoreNames.contains("RequestQueue")) {
                ZmOfflineDB.indexedDB.offlineLogDB = db;
                callback && callback();
            }
            else {
                db.close();
                ZmOfflineDB.indexedDB.openOfflineLogDB(callback, errorCallback, db.version + 1);
            }
        };
        request.onupgradeneeded = function() {
            var db = request.result;
            if (!db.objectStoreNames.contains("RequestQueue")) {
                var objectStore = db.createObjectStore("RequestQueue", {keyPath : "oid", autoIncrement : true});
                objectStore.createIndex("methodName", "methodName");
                objectStore.createIndex("methodName, id", ["methodName", "id"]);
                objectStore.createIndex("id", "id");
            }
        };
    }
    catch (e) {
        errorCallback && errorCallback();
    }
};

ZmOfflineDB.indexedDB.setItemInRequestQueue =
function(value, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.offlineLogDB,
            transaction = db.transaction("RequestQueue", "readwrite"),
            objectStore = transaction.objectStore("RequestQueue");

        if (AjxUtil.isObject(value) && value.update) {
            var indexAndKeyRange = ZmOfflineDB.indexedDB._createIndexAndKeyRange(value, objectStore),
                index = indexAndKeyRange.index,
                keyRangeArray = indexAndKeyRange.keyRangeArray;

            if (index && keyRangeArray) {
                keyRangeArray.forEach(function(keyRange) {
                    index.openCursor(keyRange).onsuccess = function(ev) {
                        var result = ev.target.result;
                        if (result) {
                            if (value.value) {
                                value.value.oid = result.primaryKey;
                                result.update(value.value);
                            }
                        }
                        else {
                            objectStore.add(value.value);
                        }
                    };
                });
            }
        }
        else if (value) {
            [].concat(value).forEach(function(val) {
                objectStore.add(val);
            });
        }
        transaction.oncomplete = callback;
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.setItemInRequestQueue : Exception : " +e);
    }
};

ZmOfflineDB.indexedDB.getItemInRequestQueue =
function(key, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.offlineLogDB,
            transaction = db.transaction("RequestQueue"),
            objectStore = transaction.objectStore("RequestQueue"),
            indexAndKeyRange = ZmOfflineDB.indexedDB._createIndexAndKeyRange(key, objectStore),
            index = indexAndKeyRange.index,
            keyRangeArray = indexAndKeyRange.keyRangeArray,
            resultArray = [];

        if (index && keyRangeArray) {
            keyRangeArray.forEach(function(keyRange) {
                index.openCursor(keyRange).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        resultArray.push(result.value);
                        result['continue']();
                    }
                };
            });
        }
        else if (key) {
            [].concat(key).forEach(function(key) {
                objectStore.get(key).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        resultArray.push(result);
                    }
                };
            });
        }
        else {
            objectStore.openCursor().onsuccess = function(ev) {
                var result = ev.target.result;
                if (result) {
                    resultArray.push(result.value);
                    result['continue']();
                }
            };
        }

        if (callback) {
            transaction.oncomplete = function() {
                callback(resultArray);
            };
        }
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.getItemInRequestQueue : Exception : " +e);
    }
};

ZmOfflineDB.indexedDB.getItemCountInRequestQueue =
function(key, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.offlineLogDB,
            transaction = db.transaction("RequestQueue"),
            objectStore = transaction.objectStore("RequestQueue"),
            indexAndKeyRange = ZmOfflineDB.indexedDB._createIndexAndKeyRange(key, objectStore),
            index = indexAndKeyRange.index,
            keyRangeArray = indexAndKeyRange.keyRangeArray,
            count = 0;

        if (index && keyRangeArray) {
            keyRangeArray.forEach(function(keyRange) {
                index.count(keyRange).onsuccess = function(ev) {
                    count += ev.target.result || 0;
                };
            });
        }
        else {
            objectStore.count().onsuccess = function(ev) {
                count = ev.target.result || 0;
            };
        }

        if (callback) {
            transaction.oncomplete = function() {
                callback(count);
            }
        }
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.getItemCountInRequestQueue : Exception : " +e);
    }
};

ZmOfflineDB.indexedDB.deleteItemInRequestQueue =
function(key, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.offlineLogDB,
            transaction = db.transaction("RequestQueue", "readwrite"),
            objectStore = transaction.objectStore("RequestQueue"),
            indexAndKeyRange = ZmOfflineDB.indexedDB._createIndexAndKeyRange(key, objectStore),
            index = indexAndKeyRange.index,
            keyRangeArray = indexAndKeyRange.keyRangeArray;

        if (index && keyRangeArray) {
            keyRangeArray.forEach(function(keyRange) {
                index.openCursor(keyRange).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        result['delete']();
                        result['continue']();
                    }
                };
            });
        }
        else if (key) {
            [].concat(key).forEach(function(key) {
                objectStore['delete'](key);
            });
        }

        transaction.oncomplete = callback;
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.deleteItemInRequestQueue : Exception : " +e);
    }
};

ZmOfflineDB.indexedDB._createIndexAndKeyRange =
function(key, objectStore) {

    var index,
        keyRangeArray = [];

    try {
        if (key.id && key.methodName) {
            index = objectStore.index("methodName, id");
            [].concat(key.methodName).forEach(function(methodName) {
                [].concat(key.id).forEach(function(id) {
                    keyRangeArray.push(IDBKeyRange.only([methodName, id]));
                });
            });
        }
        else if (key.id) {
            index = objectStore.index("id");
            [].concat(key.id).forEach(function(id) {
                keyRangeArray.push(IDBKeyRange.only(id));
            });
        }
        else if (key.methodName) {
            index = objectStore.index("methodName");
            [].concat(key.methodName).forEach(function(methodName) {
                keyRangeArray.push(IDBKeyRange.only(methodName));
            });
        }
    }
    catch (e) {
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB._createIndexAndKeyRange : Exception : " +e);
    }
    finally {
        return {
            index : index,
            keyRangeArray : keyRangeArray
        };
    }
};

ZmOfflineDB.setItem =
function(value, objectStoreName, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(objectStoreName, "readwrite");
        var objectStore = transaction.objectStore(objectStoreName);
        if (objectStoreName === ZmApp.MAIL) {
            value = ZmOffline.modifyMsg(value);
        }
        else if (objectStoreName === ZmApp.CONTACTS) {
            value = ZmOffline.modifyContact(value);
        }
        [].concat(value).forEach(function(val) {
            objectStore.put(val);
        });
        transaction.oncomplete = callback;
        transaction.onerror = errorCallback;
    } catch(e) {
        console.log("Exception ZmOfflineDB.setItem");
        DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.setItem" + e);
    }
};

ZmOfflineDB.getItem =
function(key, objectStoreName, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(objectStoreName);
        var objectStore = transaction.objectStore(objectStoreName);
        var resultArray = [];

        if (key) {
            [].concat(key).forEach(function(ele) {
                objectStore.get(ele).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        resultArray.push(result);
                    }
                };
            });
        }
        else {
            objectStore.openCursor().onsuccess = function(ev) {
                var result = ev.target.result;
                if (result) {
                    resultArray.push(result.value);
                    result['continue']();
                }
            };
        }

        if (callback) {
            transaction.oncomplete = function() {
                if (objectStoreName === ZmApp.MAIL) {
                    resultArray = ZmOffline.recreateMsg(resultArray);
                }
                else if (objectStoreName === ZmApp.CONTACTS) {
                    resultArray = ZmOffline.recreateContact(resultArray);
                }
                callback(resultArray);
            }
        }
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.getItem" + e);
    }
};

ZmOfflineDB.getItemCount =
function(key, objectStoreName, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(objectStoreName);
        var objectStore = transaction.objectStore(objectStoreName);
        var count = 0;

        if (key) {
            objectStore.count(key).onsuccess = function(ev) {
                count = ev.target.result || 0;
            };
        }
        else {
            objectStore.count().onsuccess = function(ev) {
                count = ev.target.result || 0;
            };
        }

        if (callback) {
            transaction.oncomplete = function() {
                callback(count);
            }
        }
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
    }
};

ZmOfflineDB.search =
function(search, callback, errorCallback) {
    if (!search) {
        return;
    }
    search = ZmOfflineDB._parseSearchObj(search);
    if (search.searchFor === ZmId.SEARCH_MAIL) {
        ZmOfflineDB.searchMail(search, callback, errorCallback);
    }
    else if (search.searchFor === ZmItem.CONTACT || search.contactSource === ZmItem.CONTACT) {
        ZmOfflineDB.searchContacts(search, callback, errorCallback);
    }
};

ZmOfflineDB.searchMail =
function(search, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(ZmApp.MAIL);
        var objectStore = transaction.objectStore(ZmApp.MAIL);
        var tokens = search.parsedQuery.getTokens();
        var isSearchAttachment = false;
        tokens.forEach(function(token) {
            var indexName = token.indexName;
            var indexValue = token.indexValue;
            if (indexName && indexValue) {
                token.result = [];
                var indexArray = [];
                var rangeArray = [];
                if (indexName === "content") {
                    indexArray.push(objectStore.index("subject"), objectStore.index("fragment"));
                    /*
                    var boundKeyRange = IDBKeyRange.bound(indexValue, indexValue + '\uffff');
                    var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), indexValue.toUpperCase() + '\uffff');
                    var boundKeyRangeLower = IDBKeyRange.bound(indexValue.toLowerCase(), indexValue.toLowerCase() + '\uffff');
                    var c = IDBKeyRange.bound(indexValue, indexValue + '\uffff');
                    */
                    var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
                    var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
                    var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
                    var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
                    rangeArray.push(boundKeyRangeUpper, boundKeyRangeLower);
                    isSearchAttachment = true;
                }
                else if (indexName === "size") {
                    indexArray.push(objectStore.index(indexName));
                    if (token.op === "smaller") {
                        rangeArray.push(IDBKeyRange.upperBound(indexValue, true));
                    }
                    else if (token.op === "larger") {
                        rangeArray.push(IDBKeyRange.lowerBound(indexValue, true));
                    }
                }
                else if (indexName === "type") {
                    isSearchAttachment = true;
                }
                else {
                    indexArray.push(objectStore.index(indexName));
                    rangeArray.push(IDBKeyRange.only(indexValue));
                }
                indexArray.forEach(function(index) {
                    rangeArray.forEach(function(range) {
                        index.openKeyCursor(range).onsuccess = function(token, ev) {
                            var result = ev.target.result;
                            if (result) {
                                console.log(result.key + " : " + result.primaryKey);
                                if (token.indexName === "content") {
                                    if (result.key.toLowerCase().indexOf(token.indexValue.toLowerCase()) !== -1) {
                                        token.result.push(result.primaryKey);
                                    }
                                }
                                else {
                                    token.result.push(result.primaryKey);
                                }
                                result['continue']();
                            }
                            else {
                                token.result = AjxUtil.uniq(token.result);
                            }
                        }.bind(null, token);
                    });
                });
            }
        });
        transaction.oncomplete = function() {
            var searchCallback = ZmOfflineDB._searchCallback.bind(null, search, callback, errorCallback);
            if (isSearchAttachment) {
                ZmOfflineDB.searchAttachment(search, searchCallback, errorCallback);
            }
            else {
                searchCallback();
            }
        };
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.search : Exception : " +e);
    }
};

ZmOfflineDB._parseSearchObj =
function(search) {
    var tokens = search.parsedQuery.getTokens();
    tokens.forEach(function(token) {
        if (token.op === "content" || token.op === "tag") {
            token.indexName = token.op;
            token.indexValue = token.arg;
        }
        else if (token.op === "from" || token.op === "to" || token.op === "cc") {
            token.indexName = token.op;
            token.indexValue = token.arg.toLowerCase();
        }
        else if (token.op === "has") {
            if (token.arg === "attachment") {
                token.indexName = "flags";
                token.indexValue = "a";
            }
        }
        else if (token.op === "is") {
            token.indexName = "flags";
            if (token.arg === "unread") {
                token.indexValue = "u";
            }
            else if (token.arg === "flagged") {
                token.indexValue = "f";
            }
            else if (token.arg === "draft") {
                token.indexValue = "d";
            }
            else if (token.arg === "sent") {
                token.indexValue = "s";
            }
            else if (token.arg === "replied") {
                token.indexValue = "r";
            }
            else if (token.arg === "forwarded") {
                token.indexValue = "w";
            }
            else if (token.arg === "received") {
                token.indexName = "from";
                token.indexValue = appCtxt.getLoggedInUsername();
            }
        }
        else if (token.op === "in") {
            token.indexName = "folder";
            if (token.arg === ZmFolder.QUERY_NAME[ZmFolder.ID_AUTO_ADDED]) {
                token.indexValue = ZmFolder.ID_AUTO_ADDED;
            }
            else if (token.arg === ZmFolder.QUERY_NAME[ZmFolder.ID_CONTACTS]) {
                token.indexValue = ZmFolder.ID_CONTACTS;
            }
            else {
                token.indexValue = ZmFolder["ID_" + token.arg.toUpperCase()];
            }
            if (token.indexValue) {
                token.indexValue = token.indexValue.toString();
            }
        }
        else if (token.op === "type") {
            token.indexName = token.op;
            token.indexValue = token.arg.toLowerCase();
            token.objectStoreName = ZmOffline.ATTACHMENT;
        }
        else if (token.op === "larger" || token.op === "smaller") {
            token.indexName = "size";
            if (token.arg.toLowerCase().indexOf("kb") !== -1) {
                token.indexValue = parseInt(token.arg) * 1024;
            }
            if (token.arg.toLowerCase().indexOf("mb") !== -1) {
                token.indexValue = parseInt(token.arg) * 1024 * 1024;
            }
        }
    });
    return search;
};

ZmOfflineDB._searchCallback =
function(search, callback, errorCallback) {
    var tokens = search.parsedQuery.getTokens();
    var resultArray = [];
    tokens.forEach(function(token, i) {
        var previousToken = tokens[i-1];
        if (token.result) {
            if (previousToken) {
                if (previousToken.op === "or") {
                    resultArray = AjxUtil.union(resultArray, token.result);
                }
                else if (previousToken.op === "not") {
                    resultArray = AjxUtil.arraySubtract(resultArray, token.result);
                }
                else {// default and case
                    resultArray = AjxUtil.intersection(resultArray, token.result);
                }
            }
            else {
                resultArray = token.result;
            }
        }
    });
    if (search.searchFor === ZmId.SEARCH_MAIL) {
        ZmOfflineDB.getItem(resultArray, ZmApp.MAIL, callback, errorCallback);
    }
    else if (search.searchFor === ZmItem.CONTACT || search.contactSource === ZmItem.CONTACT) {
        ZmOfflineDB._searchContactsCallback(resultArray, search, callback, errorCallback);
    }
};

ZmOfflineDB.searchAttachment =
function(search, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(ZmOffline.ATTACHMENT);
        var objectStore = transaction.objectStore(ZmOffline.ATTACHMENT);
        var tokens = search.parsedQuery.getTokens();
        tokens.forEach(function(token) {
            var indexName = token.indexName;
            var indexValue = token.indexValue;
            if (indexName && indexValue) {
                if (!token.result) {
                    token.result = [];
                }
                var rangeArray = [];
                if (indexName === "type") {
                    var index = objectStore.index(indexName);
                    rangeArray.push(IDBKeyRange.only(indexValue));
                }
                else {
                    var index = objectStore.index("name");
                    var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
                    var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
                    var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
                    var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
                    rangeArray.push(boundKeyRangeUpper, boundKeyRangeLower);
                }
            }
            rangeArray.forEach(function(range) {
                index.openKeyCursor(range).onsuccess = function(token, ev) {
                    var result = ev.target.result;
                    if (result) {
                        console.log(result.key + " : " + result.primaryKey);
                        var primaryKey = result.primaryKey;
                        var mid = primaryKey.substring(primaryKey.indexOf("id=") + 3, primaryKey.indexOf("&"));
                        if (mid) {
                            mid = parseInt(mid);
                            if (isNaN(mid) === false) {
                                token.result.push(mid);
                            }
                        }
                        result['continue']();
                    }
                    else {
                        token.result = AjxUtil.uniq(token.result);
                    }
                }.bind(null, token);
            });
        });
        transaction.oncomplete = callback;
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.searchAttachment : Exception : " +e);
    }
};

ZmOfflineDB.searchContacts =
function(search, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(ZmApp.CONTACTS);
        var objectStore = transaction.objectStore(ZmApp.CONTACTS);
        var tokens = search.parsedQuery.getTokens();
        tokens.forEach(function(token) {
            var indexName = token.indexName;
            var indexValue = token.indexValue;
            if (indexName && indexValue) {
                if (!token.result) {
                    token.result = [];
                }
                var indexArray = [];
                var rangeArray = [];
                if (indexName === "content") {
                    indexArray.push(objectStore.index("firstname"), objectStore.index("lastname"), objectStore.index("middlename"), objectStore.index("email"), objectStore.index("company"), objectStore.index("jobtitle"));
                    var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
                    var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
                    var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
                    var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
                    rangeArray.push(boundKeyRangeUpper, boundKeyRangeLower);
                }
                else {
                    indexArray.push(objectStore.index(indexName));
                    rangeArray.push(IDBKeyRange.only(indexValue));
                }

                indexArray.forEach(function(index) {
                    rangeArray.forEach(function(range) {
                        index.openKeyCursor(range).onsuccess = function(token, ev) {
                            var result = ev.target.result;
                            if (result) {
                                console.log(result.key + " : " + result.primaryKey);
                                if (token.indexName === "content") {
                                    if (result.key.toLowerCase().indexOf(token.indexValue.toLowerCase()) !== -1) {
                                        token.result.push(result.primaryKey);
                                    }
                                }
                                else {
                                    token.result.push(result.primaryKey);
                                }
                                result['continue']();
                            }
                            else {
                                token.result = AjxUtil.uniq(token.result);
                            }
                        }.bind(null, token);
                    });
                });
            }
        });

        search.sortedResult = [];
        var index = objectStore.index("fileasstr");
        if (search.lastSortVal) {
            var endSortVal = search.endSortVal || "a";
            var range = IDBKeyRange.bound(search.lastSortVal, endSortVal, false, true);
            var request = index.openKeyCursor(range);
        }
        else {
            var request = index.openKeyCursor();
        }
        request.onsuccess = function(ev) {
            var result = ev.target.result;
            if (result) {
                console.log(result.key + " : " + result.primaryKey);
                search.sortedResult.push(result.primaryKey);
                result['continue']();
            }
        };

        transaction.oncomplete = function() {
            ZmOfflineDB._searchCallback(search, callback, errorCallback);
        };
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.searchContacts : Exception : " +e);
    }
};

ZmOfflineDB._searchContactsCallback =
function(resultArray, search, callback, errorCallback) {
    if (resultArray && search.sortedResult) {
        //sort by fileasstr
        resultArray = search.sortedResult.filter(function(val) {
        if (resultArray.indexOf(val) === -1) {
                return false;
            }
            return true;
        });
    }
    ZmOfflineDB.getItem(resultArray, ZmApp.CONTACTS, callback, errorCallback);
};

ZmOfflineDB.searchContactsForAutoComplete =
function(searchStr, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(ZmApp.CONTACTS);
        var objectStore = transaction.objectStore(ZmApp.CONTACTS);
        var indexArray = [objectStore.index("firstname"), objectStore.index("email"), objectStore.index("middlename"), objectStore.index("lastname")];
        var indexValue = searchStr;
        var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
        var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
        var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
        var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
        var rangeArray = [boundKeyRangeUpper, boundKeyRangeLower];
        var resultArray = [];

        indexArray.forEach(function(index) {
            rangeArray.forEach(function(range) {
                index.openKeyCursor(range).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        console.log(result.key + " : " + result.primaryKey);
                        if (result.key.toLowerCase().indexOf(indexValue.toLowerCase()) !== -1) {
                            resultArray.push(result.primaryKey);
                        }
                        result['continue']();
                    }
                };
            });
        });
        transaction.oncomplete = function() {
            resultArray = AjxUtil.uniq(resultArray);
            ZmOfflineDB.getItem(resultArray, ZmApp.CONTACTS, callback, errorCallback);
        };
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.searchContactsForAutoComplete : Exception : " +e);
    }
};



ZmOfflineDB.doIndexSearch =
function(search, objectStoreName, formatter, callback, errorCallback, indexName) {
    try {
        var db = ZmOfflineDB.indexedDB.db;
        var transaction = db.transaction(objectStoreName);
        var objectStore = transaction.objectStore(objectStoreName);
        var resultArray = [];
        var index = objectStore.index(indexName);

        // From lower (inclusive) to upper (exclusive)
        var range = null;
        if (search.length == 1) {
            range = IDBKeyRange.only(search[0]);
        } else if (search.length == 2) {
            range = IDBKeyRange.bound(search[0], search[1], false, true);
        }
        if (range == null) {
            errorCallback && errorCallback();
            DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.search : Exception : " + e);
        } else {
            index.openCursor(range).onsuccess = function(ev) {
                var result = ev.target.result;
                if (result) {
                    resultArray.push(result.value);
                    result['continue']();
                }
            };

            if (callback) {
                transaction.oncomplete = function() {
                    if (formatter) {
                        resultArray = formatter(resultArray);
                    }
                    callback(resultArray);
                }
            }
            transaction.onerror = errorCallback;
        }
    }
    catch (e) {
        errorCallback && errorCallback();
        DBG.println(AjxDebug.DBG1, "ZmOfflineDB.indexedDB.search : Exception : " + e);
    }
}

ZmOfflineDB.indexedDB.close =
function(){
    if (ZmOfflineDB.indexedDB.db){
        ZmOfflineDB.indexedDB.db.close();
    }
    if (ZmOfflineDB.indexedDB.offlineLogDB){
        ZmOfflineDB.indexedDB.offlineLogDB.close();
    }
};

ZmOfflineDB.indexedDB.clearObjStore =
function(storeName, callback){
    var db = ZmOfflineDB.indexedDB.db;
    if (db.objectStoreNames.contains(storeName)){
        try{
            var clearTransaction = db.transaction([storeName], "readwrite");
            var clearRequest = clearTransaction.objectStore(storeName).clear();
            clearRequest.onsuccess = function(event){
                callback.run();
            }
        } catch(ex){

        }
    }
};
