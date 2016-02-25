function Highlighter(){
	//the className is the class that will be assigned to the elements
	//DO NOT REMOVE SPACES in overLap
	this.BACKGROUNDS = [];
	this.CLASS = [];
	this.START = null;
	this.END = null;
	this.COUNT = 0;
	this.overLap = " h_overlap";
	this.highlighted = "highlighted";
	this.cssIndex = -1;
};

Highlighter.prototype.addStyle = function(className, bgColor){
	//add only a class that doesn't exist.
	if(this.CLASS.indexOf(className) == -1){
		this.CLASS.push(className);
		this.BACKGROUNDS.push(bgColor);
	}
	return this;
};

Highlighter.prototype.style = function(className){
	this.cssIndex = this.CLASS.indexOf(className);
	return this;
}

Highlighter.prototype.byID = function(id, start, end){
	if(this.cssIndex == -1) 
		return null; //case of error. First have to enable a style -> ex: highlighter.style("red");
	//creating xpath
	var targetXpath = '//*[@id="' + id + '"]';
	//getting the dom element
	var targetNode = document.evaluate(targetXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;	
	this.COUNT = 0;
	this.START = start;
	this.END = end;
	//start highlighter
	this.WrapNode(targetNode);
	return this;
};

Highlighter.prototype.WrapNode = function(parentNode){
	var len = parentNode.childNodes.length;
	//clone all childnodes
	var childNodes = [];
	for(var i = 0; i < len; i++)
		childNodes.push(parentNode.childNodes[i]);
	for(var i = 0; i < len; i++){
		var child = childNodes[i];
		if(child.nodeType == 3){
			var text = child.nodeValue;
			if(this.COUNT >= this.END) continue;
			if((this.COUNT + text.length) <= this.START){
				this.COUNT += text.length;
				continue;
			}
			
			var startWrap = 0, endWrap = 0;
			
			if(this.COUNT < this.START)
				startWrap = this.START - this.COUNT;
			
			if((this.COUNT + text.length) >= this.END)
				endWrap = this.END - this.COUNT;
			else
				if(startWrap == 0)
					endWrap = text.length;
			if(parentNode.nodeType == 1 && parentNode.className.indexOf(this.highlighted) != -1)
			{	
				//wrapper is the main element that we are searching
				var wrapper = null;
				if(startWrap > 0){
					var wrapLeft = document.createElement("SPAN");
					wrapLeft.className = parentNode.className;
					wrapLeft.appendChild(document.createTextNode(text.slice(0, startWrap)));
					wrapLeft.style.background = parentNode.style.background;
					parentNode.replaceChild(wrapLeft, child);
				}
				if(endWrap > 0){
					var wrapRight = document.createElement("SPAN");
					wrapRight.className = parentNode.className;
					wrapRight.style.background = parentNode.style.background;
					wrapRight.appendChild(document.createTextNode(text.slice(endWrap)));
					parentNode.replaceChild(wrapRight, child);
					
					wrapper = document.createElement("SPAN");
					wrapper.className = parentNode.className;
					wrapper.style.background = parentNode.style.background;
					wrapper.appendChild(document.createTextNode(text.slice(startWrap, endWrap)));
					
					parentNode.insertBefore(wrapper, wrapRight);
				}
				else if(startWrap > 0){
					wrapper = document.createElement("SPAN");
					wrapper.className = parentNode.className;
					wrapper.style.background = parentNode.style.background;
					wrapper.appendChild(document.createTextNode(text.slice(startWrap)));
					parentNode.appendChild(wrapper);
				}
				if(wrapper != null){
					if(wrapper.className.indexOf(this.CLASS[this.cssIndex]) == -1)
						wrapper.className += " " + this.CLASS[this.cssIndex];
					if(wrapper.className.indexOf(this.overLap) == -1){
						wrapper.className += this.overLap;
						wrapper.style.background = "repeating-linear-gradient(45deg, " + wrapper.style.background + ", " + wrapper.style.background + "5px, " + this.BACKGROUNDS[this.cssIndex] + " 5px," + this.BACKGROUNDS[this.cssIndex] + " 10px)";
					}
					else
					{
						//getting last pixel declared
						var Gradient = wrapper.style.background.substring(wrapper.style.background.lastIndexOf(" ") + 1, wrapper.style.background.lastIndexOf("px"));
						//parsing it to integer, adding 5 and then back to string
						var newGradient = (parseInt(Gradient) + 5).toString();
						wrapper.style.background = wrapper.style.background.substring(0, wrapper.style.background.length - 1) + ", " + this.BACKGROUNDS[this.cssIndex] + " " + Gradient + "px, " + this.BACKGROUNDS[this.cssIndex] + " " + newGradient + "px)";
					}
				}
			}
			else
			{
				var wrapElement = document.createElement("SPAN");
				wrapElement.className = this.highlighted + " " + this.CLASS[this.cssIndex];
				wrapElement.style.background = this.BACKGROUNDS[this.cssIndex];
				parentNode.replaceChild(wrapElement, child);
				if(startWrap > 0) 
					//insert Before
					wrapElement.parentNode.insertBefore(document.createTextNode(text.slice(0, startWrap)), wrapElement);
				
				if(endWrap > 0)
				{
					wrapElement.appendChild(document.createTextNode(text.slice(startWrap, endWrap)));
					//insert After
					wrapElement.parentNode.insertBefore(document.createTextNode(text.slice(endWrap)), wrapElement.nextSibling);
				}
				else
					wrapElement.appendChild(document.createTextNode(text.slice(startWrap)));
			}
			this.COUNT += text.length;
		}
		else
			this.WrapNode(child);
	}
}