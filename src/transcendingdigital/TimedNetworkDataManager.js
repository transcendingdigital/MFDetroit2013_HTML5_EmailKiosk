/*
* TimedNetworkDataManager
* http://www.transcendingdigital.com
*
*
* Copyright (c) 2013 Transcending Digital LLC
* This series is intended as a state of HTML5 investigation into
* the viability of its use in touchscreen kiosk applications.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
// namespace:
this.transcendingdigital = this.transcendingdigital||{};

/**
* The purpose of this class is to attempt to globally play sound effects in the
* background.
*/
transcendingdigital.TimedNetworkDataManager = function() {
	if(false === (this instanceof transcendingdigital.TimedNetworkDataManager)) {
        return new transcendingdigital.TimedNetworkDataManager();
    }
	
	// PRIVATE PROPERTIES
	var _internalTimerID = null;
	var _xmlHttp = null;
	var _updateCallback = null;
	
	// PUBLIC METHODS
	this.init = function( _updateCallbackFunction ) {
		_updateCallback = _updateCallbackFunction;
		createTimer();
	};

	// SUPPOSEDLY PRIVATE METHODS
	function hanldeRequestAndParse() {
		doURLRequest( transcendingdigital.ApplicationEventConsts.constDataRequestURL );
		// We do this async and wait for the results to parse
	};
	function completeRequestAndParse(results) {
		if( results != "" ) {
			var parsedResults = null;
			try {
				parsedResults = JSON.parse(results);
			} catch (e) {
				if(console.log)console.log("TimedNetworkDataManager error " + e);
			}
			
			if(parsedResults != null) {
				var tempAddedElements = new Array();
				if( transcendingdigital.ApplicationEventConsts.volitlePhotoData == null ) {
					transcendingdigital.ApplicationEventConsts.volitlePhotoData = parsedResults;
					tempAddedElements = transcendingdigital.ApplicationEventConsts.volitlePhotoData;
					// Do we need to ajust its size at all?
					while( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > transcendingdigital.ApplicationEventConsts.maxPhotosInMemory ) {
						transcendingdigital.ApplicationEventConsts.volitlePhotoData.pop();
					}
				} else {
					// First, does the incoming data need adjustment?
					while( parsedResults.length > transcendingdigital.ApplicationEventConsts.maxPhotosInMemory ) {
						parsedResults.pop();
					}
					// OK, compare it to this and see if anything is different
					var different = false;
					if( parsedResults.length != transcendingdigital.ApplicationEventConsts.volitlePhotoData.length ) {
						different = true;
					} else {
						// sweet one by one
						for(var i = 0; i < parsedResults.length; i++) {
							if( transcendingdigital.ApplicationEventConsts.volitlePhotoData[i] != parsedResults[i] ) {
								different = true;
								break;
							}
						}
					}
					
					if( different == true ) {
						tempAddedElements = parsedResults;
						transcendingdigital.ApplicationEventConsts.volitlePhotoData = parsedResults;
					}
				}
				/*
				 * This is an elegant way of adding elements one or more on the front of the master image storage array.
				 * it doesnt account for if images are deleted from the cms..we need to remove them from the data
				 * shown to the users.
			     *
				// Now we need to see whats already in the data we have vs what we just got. If there are any new items, we append
				// them to the front of the data structure and pull items off the end if the max number to load has been reached
				if( transcendingdigital.ApplicationEventConsts.volitlePhotoData == null ) {
					transcendingdigital.ApplicationEventConsts.volitlePhotoData = parsedResults;
					tempAddedElements = transcendingdigital.ApplicationEventConsts.volitlePhotoData;
					
					// Do we need to ajust its size at all?
					while( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > transcendingdigital.ApplicationEventConsts.maxPhotosInMemory ) {
						transcendingdigital.ApplicationEventConsts.volitlePhotoData.pop();
					}
				} else {
					// Sweet this means we have to examine each element one by one and add new elements on the front
					var foundMatch = false;
					
					for(var i = 0; i < parsedResults.length; i++) {
						for(var j = 0; j < transcendingdigital.ApplicationEventConsts.volitlePhotoData.length; j++) {
							if( parsedResults[i] == transcendingdigital.ApplicationEventConsts.volitlePhotoData[j] ) {
								foundMatch = true;
								break;
							}
						}
						
						if(foundMatch == true) {
							break;
						} else {
							// Add the element to the front of the array
							transcendingdigital.ApplicationEventConsts.volitlePhotoData.unshift( parsedResults[i] );
							tempAddedElements.unshift( parsedResults[i] );

							//if(console.log)console.log("TimedNetworkDataManager added element: " + parsedResults[i] + " len: " + transcendingdigital.ApplicationEventConsts.volitlePhotoData.length);
							// Remove an element off the end if its too far
							if( transcendingdigital.ApplicationEventConsts.volitlePhotoData.length > transcendingdigital.ApplicationEventConsts.maxPhotosInMemory ) {
								transcendingdigital.ApplicationEventConsts.volitlePhotoData.pop();
							}
						}
					}
				}
				*/
				
				// Invoke an event so classes that need to know, will know the data may have been updated ONLY IF DATA HAS BEEN ADDED
				if( _updateCallback != null) {
					if(tempAddedElements.length > 0) {
						_updateCallback.apply(null, [{newDataArr:tempAddedElements}] );
					}
				}
			}
		}

		// Restart the timer to do it again
		createTimer();
	};
	function doURLRequest(_url) {
		_xmlHttp = null;
		_xmlHttp = new XMLHttpRequest();
		_xmlHttp.addEventListener("load", handleDataLoadComplete, false);
		_xmlHttp.addEventListener("error", handleDataLoadError, false);
		_xmlHttp.open( "GET", _url, true );
		_xmlHttp.send( null );
	};
	function handleDataLoadComplete(e) {
		if(_xmlHttp != null) {
			_xmlHttp.removeEventListener("load", handleDataLoadComplete);
			_xmlHttp.removeEventListener("error", handleDataLoadError);
			completeRequestAndParse(_xmlHttp.responseText);
		}
	};
	function handleDataLoadError(e) {
		if(_xmlHttp != null) {
			_xmlHttp.removeEventListener("load", handleDataLoadComplete);
			_xmlHttp.removeEventListener("error", handleDataLoadError);
			completeRequestAndParse("");
		}
	};
	function createTimer() {
		_internalTimerID = setInterval(handleTimer, transcendingdigital.ApplicationEventConsts.constDataRequestTimeMS );
	};
	function destroyTimer() {
		if(_internalTimerID != null) {
			clearInterval(_internalTimerID);
			_internalTimerID = null;
		}
	};
	function handleTimer(e) {
		destroyTimer();
		hanldeRequestAndParse();
	};
}