var ZmOfflineDB = {};
ZmOfflineDB.indexedDB = {};
ZmOfflineDB.indexedDB.db = null;
ZmOfflineDB.indexedDB.callbackQueue = [];
ZmOfflineDB.indexedDB.initDone = false;
window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
ZmOfflineDB.indexedDB.idxStore = "ZmOfflineIdxStore";


if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

ZmOfflineDB.indexedDB.onerror = function(e) {
    DBG.println(AjxDebug.DBG1, e);
};

ZmOfflineDB.indexedDB.open = function(callback) {
    var createObjectStore = function(){
        var db = ZmOfflineDB.indexedDB.db;
        var stores = ZmOffline.store.concat([ZmOffline.ZmOfflineStore, ZmOfflineDB.indexedDB.idxStore]);
        for (var i=0, length=stores.length; i<length;i++){
            if(!db.objectStoreNames.contains(stores[i])) {
                DBG.println(AjxDebug.DBG1, "Creating objectstore : " + stores[i]);
                var store = db.createObjectStore(stores[i], {keyPath: "key"});
            }

        }
    };

    try {
        var request = indexedDB.open("ZmOfflineDB");
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
function(callback, errorCallback) {
    var request = indexedDB.open("OfflineLog");

    request.onerror = function(event) {
        if (errorCallback) {
            errorCallback(event);
        }
    };
    request.onsuccess = function(event) {
        ZmOfflineDB.indexedDB.offlineLogDB = event.target.result;
        if (callback) {
            callback(event);
        }
    };
    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore("RequestQueue", {keyPath : "oid", autoIncrement : true});
        objectStore.createIndex("methodName", "methodName");
        objectStore.createIndex("id", "id");
    };
};

ZmOfflineDB.indexedDB.setItemInRequestQueue =
function(obj, callback, errorCallback, noRetry) {
    var db = ZmOfflineDB.indexedDB.offlineLogDB,
        error = function(event) {
            if (errorCallback) {
                errorCallback(event);
            }
        };

    if (db && db.objectStoreNames.contains("RequestQueue")) {
        var transaction = db.transaction("RequestQueue", "readwrite"),
            objectStore = transaction.objectStore("RequestQueue"),
            array = [].concat(obj);

        for (var i = 0, length = array.length; i < length; i++) {
            array[i].d = new Date().toString();
            objectStore.put(array[i]);
        }
        transaction.oncomplete = function(event) {
            if (callback) {
                callback(event);
            }
        };
        transaction.onerror = error;
    }
    else {
        if (noRetry) {
            error();
        }
        else {
            var newCallback = ZmOfflineDB.indexedDB.setItemInRequestQueue.bind(this, obj, callback, errorCallback, true);
            ZmOfflineDB.indexedDB.openOfflineLogDB(newCallback, errorCallback);
        }
    }
};

ZmOfflineDB.indexedDB.getItemInRequestQueue =
function(key, callback, errorCallback, noRetry) {
    var db = ZmOfflineDB.indexedDB.offlineLogDB,
        error = function(event) {
            if (errorCallback) {
                errorCallback(event);
            }
        };

    if (db && db.objectStoreNames.contains("RequestQueue")) {
        var transaction = db.transaction("RequestQueue"),
            objectStore = transaction.objectStore("RequestQueue"),
            array = [].concat(key),
            result = [];

        for (var i = 0, length = array.length, request; i < length; i++) {
            request = objectStore.get(array[i]);
            request.onsuccess = function(event) {
                result.push(event.target.result);
            };
        }
        transaction.oncomplete = function(event) {
            if (callback) {
                callback(result);
            }
        };
        transaction.onerror = error;
    }
    else {
        if (noRetry) {
            error();
        }
        else {
            var newCallback = ZmOfflineDB.indexedDB.getItemInRequestQueue.bind(this, key, callback, errorCallback, true);
            ZmOfflineDB.indexedDB.openOfflineLogDB(newCallback);
        }
    }
};

ZmOfflineDB.indexedDB.deleteItemInRequestQueue =
function(key, callback, errorCallback, noRetry) {

    var db = ZmOfflineDB.indexedDB.offlineLogDB,
        error = function(event) {
            if (errorCallback) {
                errorCallback(event);
            }
        };

    if (db && db.objectStoreNames.contains("RequestQueue")) {
            var transaction = db.transaction("RequestQueue", "readwrite"),
                objectStore = transaction.objectStore("RequestQueue"),
                array = [].concat(key);

            for (var i = 0, length = array.length; i < length; i++) {
                objectStore['delete'](array[i]);
            }
            transaction.oncomplete = function(event) {
                if (callback) {
                    callback(event);
                }
            };
            transaction.onerror = error;
    }
    else {
        if (noRetry) {
            error();
        }
        else {
            var newCallback = ZmOfflineDB.indexedDB.deleteItemInRequestQueue.bind(this, key, callback, errorCallback, true);
            ZmOfflineDB.indexedDB.openOfflineLogDB(newCallback);
        }
    }
};

ZmOfflineDB.indexedDB.getAllItemsInRequestQueue =
function(callback, errorCallback, noRetry) {
    var db = ZmOfflineDB.indexedDB.offlineLogDB,
        error = function(event) {
            if (errorCallback) {
                errorCallback(event);
            }
        };

    if (db && db.objectStoreNames.contains("RequestQueue")) {
        var objectStore = db.transaction("RequestQueue").objectStore("RequestQueue"),
            result = [],
            cursor = objectStore.openCursor();

        cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                result.push(cursor.value);
                cursor['continue']();
            }
            else {
                if (callback) {
                    callback(result);
                }
            }
        };
        cursor.onerror = error;
    }
    else {
        if (noRetry) {
            error();
        }
        else {
            var newCallback = ZmOfflineDB.indexedDB.getAllItemsInRequestQueue.bind(this, callback, errorCallback, true);
            ZmOfflineDB.indexedDB.openOfflineLogDB(newCallback);
        }
    }
};

ZmOfflineDB.indexedDB.actionsInRequestQueueUsingIndex =
function(indexObj, callback, errorCallback, noRetry) {
    var db = ZmOfflineDB.indexedDB.offlineLogDB,
        error = function(event) {
            if (errorCallback) {
                errorCallback(event);
            }
        };

    if (db && db.objectStoreNames.contains("RequestQueue")) {
        var transaction = db.transaction("RequestQueue"),
            objectStore = transaction.objectStore("RequestQueue"),
            index,
            keyRange,
            cursor,
            results = [];

        if (indexObj.id) {
            indexObj.id = [].concat(indexObj.id);
        }
        if (indexObj.methodName) {
            index = objectStore.index("methodName");
            keyRange = IDBKeyRange.only(indexObj.methodName);
            cursor = index.openCursor(keyRange);
        }
        else if (indexObj.id && indexObj.id.length === 1) {
            index = objectStore.index("id");
            keyRange = IDBKeyRange.only(indexObj.id[0]);
            cursor = index.openCursor(keyRange);
        }

        cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor['continue']();
            }
        };
        cursor.onerror = error;

        transaction.oncomplete = function(event) {
            if (indexObj.methodName && indexObj.id) {
                var newResults = [];
                for (var i = 0; i < results.length; i++) {
                    for (var j = 0; j < indexObj.id.length; j++) {
                        if (results[i].id === indexObj.id[j]) {
                            newResults.push(results[i]);
                        }
                    }
                }
            }
            var array = newResults || results;
            if (indexObj.operation === "add") {
                if (array[0] && array[0].oid) {
                    indexObj.value.oid = array[0].oid;
                    if (indexObj.onBeforeAddCallback) {
                        indexObj.onBeforeAddCallback(array[0], indexObj.value);
                    }
                }
                ZmOfflineDB.indexedDB.setItemInRequestQueue(indexObj.value, callback, errorCallback);
            }
            else {
                var primaryKeys = [];
                for (var i = 0; i < array.length; i++) {
                    primaryKeys.push(array[i].oid);
                }
                if (indexObj.operation === "delete") {
                    ZmOfflineDB.indexedDB.deleteItemInRequestQueue(primaryKeys, callback, errorCallback);
                }
                else {
                    ZmOfflineDB.indexedDB.getItemInRequestQueue(primaryKeys, callback, errorCallback);
                }
            }
        };
    }
    else {
        if (noRetry) {
            error();
        }
        else {
            var newCallback = ZmOfflineDB.indexedDB.actionsInRequestQueueUsingIndex.bind(this, indexObj, callback, errorCallback, true);
            ZmOfflineDB.indexedDB.openOfflineLogDB(newCallback);
        }
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