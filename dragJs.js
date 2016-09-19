!(function(g) {
	var dragNum = 0;

	var dragJs = function(option) {
		this.option = {
			draggable: true,
			parent: "body", //默认父元素是body
			space_insert: true, //间隙可插入
			drag_arr: [],
			replace: false
		};
		this.extend(this.option, option);
		this.initEvent();
	};

	dragJs.prototype.extend = function(target, obj) { //扩展
		for (var i in obj) {
			target[i] = obj[i];
		}
	};

	dragJs.prototype.querySelector = function(string) {
		if (document.querySelector) {
			return document.querySelector(string);
		} else {
			var parentEl;
			var querySingleSelector = function(str, parEl) {
				var parele = parEl ? parEl : document;
				return /^\.\w+$/ig.test(str) ? parele.getElementsByClassName(str.slice(1))[0] : /^\#\w+$/ig.test(str) ? parele.getElementById(str.slice(1)) : parele.getElementsByTagName(str);
			}
			return /\s*\w+\s+\w+\s*/ig.test(string) ? (string = string.replace(/^\s+|\s+$/ig, ""), string = string.split(/\s+/ig) & string.forEach(function(item, index) {
				if (!parentEl) parentEl = querySingleSelector(item);
				else parentEl = querySingleSelector(item, parentEl)
			}), parentEl) : querySingleSelector(string);
		}
	}

	dragJs.prototype.hasClass = function(obj, cla) { //判断是否拥有类名
		var re = new RegExp("(^|\\s)" + cla + "(\\s|$)");
		return re.test(obj.className);
	};

	dragJs.prototype.addClass = function(obj, cla) { //添加类名
		if (this.hasClass(obj, cla)) {
			return;
		}
		var newclass = obj.className.split(' ');
		newclass.push(cla);
		obj.className = newclass.join(' ');
	};

	dragJs.prototype.removeClass = function(obj, cla) { //删除类名
		if (!this.hasClass(obj, cla)) {
			return;
		}
		var re = new RegExp("(^|\\s)" + cla + "(\\s|$)", 'g');
		obj.className = obj.className.replace(re, " ").replace(/^\s+|\s+$/ig, "");

	};

	dragJs.prototype.initEvent = function() { //初始化方法
		var _this = this;
		this.dragWrap = this.querySelector(this.option.parent);
		if (this.option.space_insert && (!this.option.spaceClass || !this.querySelector("." + this.option.spaceClass, this.dragWrap))) this.option.space_insert = false;
		this.draglist = this.dragWrap.children;
		var eventFun = arguments[0] ? "remove" : "add";
		for (var i = 0; i < this.draglist.length; i++) {
			this.draglist[i].draggable = !arguments[0];
		}
		this.addClass(this.dragWrap, "dragWrap");
		var addEvent = function(eventType) {
			_this.dragWrap[eventFun + "EventListener"](eventType, _this, false);
		};
		var addEventArr = ["dragstart", "dragover", "dragenter", "drop"];
		if (!window.ActiveXObject && !("ActiveXObject" in window)) {
			addEventArr.push("mouseenter", "mouseleave");
		} else {
			document.body.ondragover = function() {
				event.preventDefault();
			};
			document.body.ondrop = function() {
				var drag_active = _this.querySelector(".drag_active");
				if (drag_active) _this.removeClass(drag_active, "drag_active");
			}
		};
		addEventArr.forEach(function(type) {
			addEvent(type);
		});
	};

	dragJs.prototype.findTarget = function(e, space) { //根寻目标源
		var thisTarget = e.target;
		if(this.hasClass(thisTarget, "dragWrap")) return false;
		while (thisTarget.parentNode && !this.hasClass(thisTarget.parentNode, "dragWrap")) {
			if ((this.option.space_insert && space && this.hasClass(thisTarget.parentNode.parentNode, "dragWrap"))) return thisTarget;
			thisTarget = thisTarget.parentNode;
		};
		if (thisTarget.parentNode) return thisTarget;
		else return false;
	};

	dragJs.prototype.destory = function(e) { //销毁事件
		this.initEvent(true);
	};

	dragJs.prototype._mouseenter = function(e) {
		if (this.mountStart) this.startObj = this.mountStart;
	};

	dragJs.prototype._mouseleave = function(e) {
		if (this.startObj) this.mountStart = this.startObj, delete this.startObj;
		var drag_active = this.querySelector(".drag_active");
		if (drag_active) this.removeClass(drag_active, "drag_active");
	};

	dragJs.prototype._dragstart = function(e) {
		this.startObj = this.findTarget(e);
	};

	dragJs.prototype._dragover = function(e) {
		event.preventDefault();
	};

	dragJs.prototype._dragenter = function(e) {
		this.enterObj = this.findTarget(e, true);
		console.log(this.enterObj)
		if (!this.enterObj || !this.startObj) return;
		var drag_active = this.querySelector(".drag_active");
		if (drag_active) this.removeClass(drag_active, "drag_active");
		this.addClass(this.enterObj, "drag_active");
	};

	dragJs.prototype._drop = function(e) {
		var drag_active = this.querySelector(".drag_active");
		if (drag_active) this.removeClass(drag_active, "drag_active");
		this.arr = this.option.drag_arr;
		var arrLength = this.arr.length;
		this.enterObj = this.findTarget(e, true);
		if (!this.enterObj || !this.startObj) return;
		this.draglist = this.dragWrap.children;
		var draglist = this.draglist;
		var dargListNum = draglist.length;
		var targetEl = this.enterObj;
		var space_target = this.option.spaceClass && this.hasClass(this.enterObj, this.option.spaceClass);
		this.enterObj = this.option.space_insert ? this.enterObj.parentNode : this.enterObj;
		var insertIndex = this.index(this.enterObj, draglist);
		var dragNum = this.index(this.startObj, draglist);
		if (this.option.replace && !space_target) { //替换逻辑
			var replaceold = this.enterObj.cloneNode(true);
			var replacenew = this.startObj.cloneNode(true);
			this.dragWrap.replaceChild(replacenew, this.enterObj);
			this.dragWrap.replaceChild(replaceold, this.startObj);
			var aaa = this.arr[insertIndex];
			this.arr.splice(insertIndex, 1, this.arr[dragNum]);
			this.arr.splice(dragNum, 1, aaa);
			return;
		}
		if (arrLength) {
			var aaa = this.arr[dragNum];
			this.arr.splice(dragNum, 1);
		};
		if (insertIndex >= dragNum) {
			if (insertIndex == 0) {
				if (arrLength) this.arr.splice(insertIndex, 0, aaa);
				this.dragWrap.insertBefore(this.startObj, this.enterObj);
				return;
			}
			insertIndex--;
			if (arrLength) this.arr.splice(insertIndex + 1, 0, aaa);
			this.after(this.startObj, this.enterObj);
		} else {
			if (space_target) {
				insertIndex++;
				if (insertIndex == dargListNum - 1 && dragNum == dargListNum - 1) {
					this.arr.splice(insertIndex, 0, aaa);
				}
				if (arrLength) this.arr.splice(insertIndex, 0, aaa);
				return this.after(this.startObj, this.enterObj);
			}
			if (arrLength) this.arr.splice(insertIndex, 0, aaa);
			this.dragWrap.insertBefore(this.startObj, this.enterObj);
		};
	}

	dragJs.prototype.after = function(newEl, targetEl) { //向后插入dom结构方法
		var parentEl = this.dragWrap;
		if (parentEl.lastChild == targetEl) {
			parentEl.appendChild(newEl);
		} else {
			parentEl.insertBefore(newEl, targetEl.nextSibling);
		}
	};

	dragJs.prototype.index = function(current, obj) { //索引
		for (var i = 0; i < obj.length; i++) {
			if (obj[i] == current) {
				return i;
			}
		}
	};

	dragJs.prototype.handleEvent = function(e) {
		var eventFun = "_" + e.type;
		if (typeof this[eventFun] == "function") this[eventFun](e);
		var callback = this.option[eventFun];
		if (typeof callback == "function") callback(this, e);
	};

	Object.defineProperty(g, "dragJs", {
		configurable: true,
		enumerable: true,
		value: dragJs
	});

})(this);