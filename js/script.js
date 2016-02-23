function Highlighter(className){
	//the className is the class that will be assigned to the elements
	this.CLASS = className;
	this.START = null;
	this.END = null;
	this.COUNT = 0;
};

Highlighter.prototype.byID = function(id, start, end){
	//creating xpath
	var targetXpath = '//*[@id="' + id + '"]';
	//getting the dom element
	var targetNode = document.evaluate(targetXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;	
	this.COUNT = 0;
	this.START = start;
	this.END = end;
	//start highlighter
	this.WrapNode(targetNode);
};

Highlighter.prototype.WrapNode = function(parentNode){
	var len = parentNode.childNodes.length;
	for(var i = 0; i < len; i++){
		var child = parentNode.childNodes[i];
		if(child.nodeType == 3){
			var text = child.nodeValue;
			if(this.COUNT >= this.END) continue;
			if((this.COUNT + text.length) <= this.START || text.trim() == ""){
				this.COUNT += text.length;
				continue;
			}
			
			var startWrap = 0;
			var endWrap = -1;
			
			if(this.COUNT < this.START)
				startWrap = this.START - this.COUNT;
			
			if((this.COUNT + text.length) > this.END)
				endWrap += this.END - this.COUNT;
			
			if(parentNode.nodeType == 1 && parentNode.className.indexOf("highlighted") != -1)
			{
				if(startWrap > 0){
					var wrapLeft = document.createElement("SPAN");
					wrapLeft.className = parentNode.className;
					wrapLeft.appendChild(document.createTextNode(text.slice(0, startWrap)));
					wrapLeft.style.background = parentNode.style.background;
					parentNode.replaceChild(wrapLeft, child);
				}
				if(endWrap != -1){
					var wrapRight = document.createElement("SPAN");
					wrapRight.className = parentNode.className;
					wrapRight.style.background = parentNode.style.background;
					wrapRight.appendChild(document.createTextNode(text.slice(endWrap)));
					parentNode.replaceChild(wrapRight, child);
					parentNode.insertBefore(document.createTextNode(text.slice(startWrap, endWrap)), wrapRight);
				}
				else
					parentNode.appendChild(document.createTextNode(text.slice(startWrap)));
			
				if(parentNode.className.indexOf(this.CLASS) == -1) parentNode.className += " " + this.CLASS;
				if(parentNode.className.indexOf("h_overlap") == -1) parentNode.className += " h_overlap";
			}
			else
			{
				var wrapElement = document.createElement("SPAN");
				wrapElement.className = "highlighted " + this.CLASS;
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