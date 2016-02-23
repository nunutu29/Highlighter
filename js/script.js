function Highlighter(className){
	//the className is the class that will be assigned to the elements
	this.CLASS = className;
	this.START = null;
	this.END = null;
	this.COUNTER = 0;
};

Highlighter.prototype.COUNT = function(value){
	if(value == undefined || value == null || value == "")
		return this.COUNTER;
	else
		this.COUNTER += value;
};

Highlighter.prototype.byID = function(id, start, end){
	var targetXpath = '//*[@id="' + id + '"]';
	var targetNode = $(document.evaluate(targetXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
	this.COUNT(0);
	this.START = start;
	this.END = end;
	this.WrapNode(targetNode);
};

Highlighter.prototype.byText = function(text){
	var context = this;
	$('body *').contents().filter(function() { 
		return this.nodeType == 3 && this.nodeValue.length > 0 && this.nodeValue.indexOf(text) != -1 && this.parentNode.nodeName != "SCRIPT"; 
	}).each(function(){
		$(this).replaceWith(this.nodeValue.replace(new RegExp(text,"g"), '<span class="'+context.CLASS+'">'+text+'</span>'));
	});
};

Highlighter.prototype.WrapNode = function(node){
	var context = this;
	$(node).contents().each(function() {
		if(this.nodeType == 3)
		{
			var text = $(this).text();
			if(context.COUNT() >= context.END) return;
			if((context.COUNT() + text.length) <= context.START || text.trim() == ""){
				context.COUNT(text.length);
				return;
			}
			var startWrap = 0;
			var endWrap = -1;
			
			if(context.COUNT() < context.START)
				startWrap = context.START - context.COUNT();
			
			if((context.COUNT() + text.length) > context.END)
				endWrap += context.END - context.COUNT();
			
			var parentNode = this.parentNode;
			if(parentNode.nodeType == 1 && parentNode.classList.contains("highlighted"))
			{
				var wrapMid = $(parentNode);
				var target = [];
				
				if(startWrap > 0){
					var wrapLeft = $("<span>");
					wrapLeft.attr("class", wrapMid.attr("class"));
					wrapLeft.text(text.slice(0,startWrap));
					wrapLeft.css('background', wrapMid.css('background'));
					wrapMid.before(wrapLeft);
				}
				if (endWrap != -1) {
					var wrapRight = $("<span>");
					wrapRight.attr('class', wrapMid.attr('class'));
					wrapRight.css('background', wrapMid.css('background'));
					wrapRight.text(text.slice(endWrap));
					wrapMid.after(wrapRight);
					wrapMid.text(text.slice(startWrap,endWrap));
				}
				else
					wrapMid.text(text.slice(startWrap));
				
				if(!wrapMid.hasClass(context.CLASS)) wrapMid.addClass(context.CLASS);
				if(!wrapMid.hasClass("h_overlap")) wrapMid.addClass("h_overlap");
				//add here a gradient function
			}
			else
			{
				var wrapElement = $("<span>").addClass("highlighted " + context.CLASS);
				$(this).replaceWith(wrapElement);
				
				if(startWrap > 0)
					wrapElement.before(text.slice(0, startWrap));
				
				if(endWrap > 0){
					wrapElement.text(text.slice(startWrap, endWrap));
					wrapElement.after(text.slice(endWrap));
				}
				else
					wrapElement.text(text.slice(startWrap));
			}
			context.COUNT(text.length);
		}
		else
			context.WrapNode(this);
	});
};