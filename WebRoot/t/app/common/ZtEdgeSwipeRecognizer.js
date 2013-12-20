Ext.define('ZCS.common.ZtEdgeSwipeRecognizer', {
    extend: 'Ext.event.recognizer.Swipe',
    // Don't do anything for edge swipes
    handledEvents: [],
    onTouchEnd: function () {
    	return false;
    },
    onTouchStart: function () {
    	return false;
    },
    onTouchMove: function () {
    	return false;
    }
});

