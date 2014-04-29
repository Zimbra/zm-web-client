Ext.define('ZCS.common.ZtTouchEvent', {
	singleton: true,
	/**
	 * A function for programmatically generating a touch event
	 * If this is running in a browser without touch events, a click is create instead.
	 *
	 * @param (required) {String}          type           The type of touch event (touchstart, touchmove, touchend)
	 * @param (required) {HtmlElement}     target         The intended target of the touch event.
	 * @param (required) {int}             pageX          Xcoordinate of the touch.
	 * @param (required) {int}             pageY          Ycoordinate of the touch.
     * @param (optional) {int}             id             The id of the event.
	 * @param (optional) {Boolean}         ctrlKey        Whether the control key is pressed.
	 * @param (optional) {Boolean}         altKey         Whether the alt key is pressed.
	 * @param (optional) {Boolean}         shiftKey       Whether the shift key is pressed.
	 * @param (optional) {Boolean}         metaKey        Whether the meta key is pressed.
	 * @param (optional) {TouchCollection} touches        The collection of touches in this touch event.  If not provided, will be a single touch using the required parameters.
	 * @param (optional) {TouchCollection} targetTouches  The collection of touches in this touch event.  If not provided, will be a single touch using the required parameters.
	 * @param (optional) {TouchCollection} changedTouches The collection of touches in this touch event.  If not provided, will be a single touch using the required parameters.
	 * @param (optional) {int}             scale          The scale of the touch.  Not applicable in ios, 
	 * @param (optional) {int}             rotation       The rotation of the touch, Not applicable in ios.
	 */
	makeTouchEvent: function (type, target, pageX, pageY, id, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation) {
        
		var newEvent = document.createEvent('TouchEvent');

		if (!touches) {
			touches = this.createTouchCollection(target, pageX, pageY, id);
		}

		if (!changedTouches) {
			changedTouches = this.createTouchCollection(target, pageX, pageY, id);
		}

		if (!targetTouches) {
			targetTouches = this.createTouchCollection(target, pageX, pageY, id);
		}

		scale = scale || 1.0;
		rotation = rotation || 0.0;
		altKey = altKey || false;
		shiftKey = shiftKey || false;
		metaKey = metaKey || false;

        /*
            The arguments are different for IOS and Android for the initTouchEvent function

         // IOS initTouchEvent
         //https://developer.apple.com/library/safari/documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html#//apple_ref/javascript/instm/TouchEvent/initTouchEvent
         event.initTouchEvent (
         type,
         canBubble,
         cancelable,
         view,
         detail,
         screenX,
         screenY,
         clientX,
         clientY,
         ctrlKey,
         altKey,
         shiftKey,
         metaKey,
         touches,
         targetTouches,
         changedTouches,
         scale,
         rotation
         );


         // Android initTouchEvent
         // http://tech.kayac.com/archive/javascript_inittouchevent.html
         event.initTouchEvent (
         touches,
         targetTouches,
         changedTouches,
         eventType,
         view,
         screenX,
         screenY,
         clientX,
         clientY,
         ctrlKey,
         altKey,
         shiftKey,
         metaKey
         );
         */

        if (Ext.os.is.Android) {
            newEvent.initTouchEvent(
                touches, //touches, A collection of Touch objects representing all touches associated with this event.
                targetTouches, //targetTouches, A collection of Touch objects representing all touches associated with this target.
                changedTouches, //changedTouches, A collection of Touch objects representing all touches that changed in this event.
                type, //type, The type of event that occurred.
                window, //view, The view (DOM window) in which the event occurred.
                pageX, //screenX The x-coordinate of the event’s location in screen coordinates.
                pageY, //screenY The y-coordinate of the event’s location in screen coordinates.
                pageX, //clientX The x-coordinate of the event’s location relative to the window’s viewport.
                pageY, //clientY The y-coordinate of the event’s location relative to the window’s viewport.
                ctrlKey, //ctrlKey, If true, the control key is pressed; otherwise, it is not.
                altKey, //altKey If true, the alt key is pressed; otherwise, it is not.
                shiftKey, //shiftKey If true, the shift key is pressed; otherwise, it is not.
                metaKey //metaKey If true, the meta key is pressed; otherwise, it is not.
            );
        } else {
            newEvent.initTouchEvent(
                type, //type, The type of event that occurred.
                true, //canBubble, Indicates whether an event can bubble. If true, the event can bubble; otherwise, it cannot.
                true, //cancelable, Indicates whether an event can have its default action prevented. If true, the default action can be prevented; otherwise, it cannot.
                window, //view, The view (DOM window) in which the event occurred.
                null, //detail Specifies some detail information about the event depending on the type of event.
                pageX, //screenX The x-coordinate of the event’s location in screen coordinates.
                pageY, //screenY The y-coordinate of the event’s location in screen coordinates.
                pageX, //clientX The x-coordinate of the event’s location relative to the window’s viewport.
                pageY, //clientY The y-coordinate of the event’s location relative to the window’s viewport.
                ctrlKey, //ctrlKey, If true, the control key is pressed; otherwise, it is not.
                altKey, //altKey If true, the alt key is pressed; otherwise, it is not.
                shiftKey, //shiftKey If true, the shift key is pressed; otherwise, it is not.
                metaKey, //metaKey If true, the meta key is pressed; otherwise, it is not.
                touches, //touches, A collection of Touch objects representing all touches associated with this event.
                targetTouches, //targetTouches, A collection of Touch objects representing all touches associated with this target.
                changedTouches, //changedTouches, A collection of Touch objects representing all touches that changed in this event.
                scale, //scale The distance between two fingers since the start of an event as a multiplier of the initial distance. The initial value is 1.0. If less than 1.0, the gesture is pinch close (to zoom out). If greater than 1.0, the gesture is pinch open (to zoom in).
                rotation //rotation The delta rotation since the start of an event, in degrees, where clockwise is positive and counter-clockwise is negative. The initial value is 0.0.
            );
        }

        newEvent.actionTarget = target;

        return newEvent;
	},

	createTouchCollection: function (target, pageX, pageY, id) {
		var newTouch = window.document.createTouch(
            window,
            target,
            id,
            pageX, //pageX
            pageY, //pageY
            pageX, //oldTouch.screenX, //screenX
            pageY, //oldTouch.screenX, //screenY
            pageX, //oldTouch.clientX, //clientX
            pageY //oldTouch.clientY //clientY
        );

        return window.document.createTouchList.apply(window.document, [newTouch]);
	}
});