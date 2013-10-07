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
        var stores = ZmOffline.store.concat([ZmOffline.ZmOfflineStore, ZmOffline.ZmOfflineAttachmentStore, ZmOfflineDB.indexedDB.idxStore]);
        for (var i=0, length=stores.length; i<length;i++){
            if(!db.objectStoreNames.contains(stores[i])) {
                DBG.println(AjxDebug.DBG1, "Creating objectstore : " + stores[i]);
                var store = db.createObjectStore(stores[i], {keyPath: "key"});
            }

        }
    };

    try {
        var request = (version) ? indexedDB.open("ZmOfflineDB", version) : indexedDB.open("ZmOfflineDB");
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
    finally {
        return {
            index : index,
            keyRangeArray : keyRangeArray
        };
    }
};

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
