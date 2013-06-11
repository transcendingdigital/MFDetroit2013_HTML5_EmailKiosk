/*
* UtilVisualHelper
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
* The real problem with easelJS in the current technology landscape is that we
* need to move elements on the main canvas but also html elements. Its a huge
* PAIN. This class is supposed to consolodate interactions of HTML Elements
* and easelJS/createJS items on the display canvas and html page.
*/
transcendingdigital.UtilVisualHelper = function() {
	if(false === (this instanceof transcendingdigital.UtilVisualHelper)) {
        return new transcendingdigital.UtilVisualHelper();
    }
	
	// PRIVATE PROPERTIES
	var _HTMLContainerElement = null;
	var _HTMLChildren = null;
	
	var _EaselDrawingGroup = null;
	var _EaselChildren = null;
	
	this._currentWidth = 0;
	this._currentHeight = 0;
	
	// EVENT--CALLBACK SECTION
	//-------------------------
	var _storedEventCallbacks = null;
	
	this.latchCustomEvent = function(_eventConstantKey, _CallbackFunction) {
		if(_storedEventCallbacks == null) {
			_storedEventCallbacks = new Array();
		}
		_storedEventCallbacks[_eventConstantKey] = _CallbackFunction;
	};
	this.unlatchCustomEvent = function(_eventConstantKey) {
		if( _storedEventCallbacks[_eventConstantKey] != null ) {
			_storedEventCallbacks[_eventConstantKey] = null;
		}
	};
	this.raiseCustomEvent = function(_eventConstantKey, _aggArray) {
		if( _storedEventCallbacks[_eventConstantKey] != null ) {
			_storedEventCallbacks[_eventConstantKey].apply(null,_aggArray);
		}
	};
	//---------------------------
	
	// PUB METHODS
	this.init = function(_w, _h, _initX, _initY, _alpha) {
		this._currentWidth = _w;
		this._currentHeight = _h;
		
		 _EaselDrawingGroup = new createjs.Container();
		 _EaselDrawingGroup.x = _initX;
		 _EaselDrawingGroup.y = _initY;
		 _EaselDrawingGroup.alpha = _alpha;
		 transcendingdigital.globalStage.addChild(_EaselDrawingGroup);
	};
	this.resizeArea = function(_w,_h) {
		this._currentWidth = _w;
		this._currentHeight = _h;
		
	};
	this.fitTextInField = function(_parentToFitTo, _textContainer) {
		var maximumRuns = 50;
		var currentRun = 0;
		var currentSize = 0;
		// Careful fontsize will be like 120px..a string
		var baseFontSize = document.defaultView.getComputedStyle(_textContainer, null).fontSize;
		if(!baseFontSize) {
			return;
		} else {
			// This property may be not set - so set it for a baseline
			_textContainer.style.fontSize = baseFontSize;
			currentSize = baseFontSize.replace("px","");
		}
		
		if(_parentToFitTo != null && _textContainer != null) {
			while( ( (_textContainer.offsetHeight + 10) > _parentToFitTo.offsetHeight) && ( currentRun < maximumRuns) ) {
				currentSize -= 2;
				_textContainer.style.fontSize = currentSize + "px";
				currentRun ++;
			}
		}
	};
	this.moveSection = function(_newX, _newY, _onCompleteFunction, _arguments) {
		if(_EaselDrawingGroup != null) {
			createjs.Tween.get(_EaselDrawingGroup,{override:true}).to({x:_newX,y:_newY}, 1000, createjs.Ease.quadIn);
		}
		if(_HTMLContainerElement != null) {
			createjs.Tween.get(_HTMLContainerElement,{override:true}).to({left:_newX,top:_newY}, 1000, createjs.Ease.quadIn).call(_onCompleteFunction, _arguments);
		}
	};
	this.showSection = function(_onCompleteFunction, _arguments) {
		if(_EaselDrawingGroup != null) {
			createjs.Tween.get(_EaselDrawingGroup,{override:true}).to({alpha:1}, 500, createjs.Ease.quadIn);
		}
		if(_HTMLContainerElement != null) {
			createjs.Tween.get(_HTMLContainerElement,{override:true}).to({alpha:1}, 500, createjs.Ease.quadIn).call(_onCompleteFunction, _arguments);
		}
	};
	this.hideSection = function(_onCompleteFunction, _arguments) {
		if(_EaselDrawingGroup != null) {
			createjs.Tween.get(_EaselDrawingGroup,{override:true}).to({alpha:0}, 500, createjs.Ease.quadIn);
		}
		if(_HTMLContainerElement != null) {
			createjs.Tween.get(_HTMLContainerElement,{override:true}).to({alpha:0}, 500, createjs.Ease.quadIn).call(_onCompleteFunction, _arguments);
		}
	};
	this.destroyInternals = function() {
		if(_storedEventCallbacks != null) {
			for(var eCnt = _storedEventCallbacks.length - 1; eCnt > -1; eCnt--) {
				_storedEventCallbacks[eCnt] = null;
				_storedEventCallbacks.splice(eCnt,1);
			}
			_storedEventCallbacks = null;
		}
		if(_HTMLContainerElement != null) {
			
			if(_HTMLChildren != null) {
				for(var hc = _HTMLChildren.length - 1; hc > -1; hc--) {
					_HTMLContainerElement.removeChild(_HTMLChildren[hc]);
					_HTMLChildren[hc] = null;
					_HTMLChildren.splice(hc,1);
				}
			}
			
			transcendingdigital.globalParentRef.removeChild(_HTMLContainerElement);
			_HTMLContainerElement = null;
		}
		if(_EaselDrawingGroup != null) {
			
			if(_EaselChildren != null) {
				for(var ec = _EaselChildren.length - 1; ec > -1; ec--) {
					_EaselDrawingGroup.removeChild( _EaselChildren[ec] );
					_EaselChildren[ec] = null;
					_EaselChildren.splice(ec,1);
				}
				_EaselChildren = null;
			}
			// Remove the drawing group from the main stage
			transcendingdigital.globalStage.removeChild(_EaselDrawingGroup);
			_EaselDrawingGroup = null;
		}
	};
	/**
	* We have to move html elements based on bottom and top
	* using their style. We need to only mod the certain style properties
	* as others may be set to stylize the object
	*/
	this.moveHTMLObj = function(_ObjectRef, _x, _y) {
		if(_HTMLContainerElement != null) {
			if(_HTMLChildren != null) {
				for(var hc = _HTMLChildren.length - 1; hc > -1; hc--) {
					if( _HTMLChildren[hc] == _ObjectRef ) {
						_HTMLChildren[hc].style.top = _x + 'px';
						_HTMLChildren[hc].style.left = _y + 'px';
						break;
					}
				}
			}
		}
	};
	this.addCanvasElement = function(_ObjectRef, _optionalIndex) {
		if(_EaselChildren == null) {
			_EaselChildren = new Array();
		}
		_EaselChildren.push(_ObjectRef);
		
		if(_optionalIndex != undefined) {
			_EaselDrawingGroup.addChildAt(_ObjectRef, _optionalIndex);
		} else {
			_EaselDrawingGroup.addChild(_ObjectRef);
		}
	};
	this.removeCanvasElement = function(_ObjectRef) {
		if(_EaselChildren == null || _EaselDrawingGroup == null) {
			return;
		}
		for(var hc = _EaselChildren.length - 1; hc > -1; hc--) {
			if( _EaselChildren[hc] == _ObjectRef ) {
				_EaselDrawingGroup.removeChild(_EaselChildren[hc]);
				_EaselChildren[hc] = null;
				_EaselChildren.splice(hc,1);
				break;
			}
		}
	};
	this.addHTMLElement = function(_ObjectRef) {
		if(_HTMLContainerElement == null) {
			initMainHTMLContainer();
		}
		if(_HTMLChildren == null) {
			_HTMLChildren = new Array();
		}
		_HTMLChildren.push( _ObjectRef );
		_HTMLContainerElement.appendChild(_ObjectRef);
			
	};
	this.addHTMLElementBefore = function(_ObjectRef, _BeforeObjectRef) {
		if(_HTMLContainerElement == null) {
			initMainHTMLContainer();
		}
		if(_HTMLChildren == null) {
			_HTMLChildren = new Array();
		}
		_HTMLChildren.push( _ObjectRef );
		_HTMLContainerElement.insertBefore(_ObjectRef, _BeforeObjectRef);
	};
	this.removeHTMLElement = function(_ObjectRef) {
		if(_HTMLChildren == null || _HTMLContainerElement == null) {
			return;
		}
		for(var hc = _HTMLChildren.length - 1; hc > -1; hc--) {
			if( _HTMLChildren[hc] == _ObjectRef ) {
				// This element may have children so we need to account for those
				//for(var targetChild in _HTMLChildren[hc]) {
				//	if (!_HTMLChildren[hc].hasOwnProperty(targetChild))
				//		continue;       // skip this property
				//	if (targetChild == "child")
				//		alert("UtilVisualHelper - a Child " + targetChild)
				//}
				_HTMLContainerElement.removeChild(_HTMLChildren[hc]);
				_HTMLChildren[hc] = null;
				_HTMLChildren.splice(hc,1);
				break;
			}
		}
			
	};
	// PRIVATE MEMBERS
	function initMainHTMLContainer() {
		if(_HTMLContainerElement == null) {
			_HTMLContainerElement = document.createElement("div");
			_HTMLContainerElement.setAttribute("id", "IDsoleMainHtmlContainer");
			_HTMLContainerElement.setAttribute("name", "soleMainHtmlContainer");
			_HTMLContainerElement.setAttribute("style", "position:absolute;top:0px;left:0px;");
			// Use the easel drawing group to initialize x and y on top of the canvas
			_HTMLContainerElement.style.top = _EaselDrawingGroup.x + 'px';
			_HTMLContainerElement.style.left = _EaselDrawingGroup.y + 'px';
			transcendingdigital.globalParentRef.appendChild(_HTMLContainerElement);
		}
	}
}