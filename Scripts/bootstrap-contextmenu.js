String.prototype.format = function () {
	var content = this;
	for (var i = 0; i < arguments.length; i++) {
		var replacement = '{' + i + '}';
		content = content.replace(replacement, arguments[i]);
	}
	return content;
};
function isNullOrEmpty(t) {
	return typeof (t) === 'undefined' || t === null || t === "" || t.toString().trim() == "";
};
Guid = function () {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";
	var uuid = s.join("");
	return uuid;
};
bootstrapContextMenu = function (parameters) {
	var that = this;
	this.defaults = {
		id: undefined,
		selector: undefined,
		css: undefined,
		items: [
			{ title: 'Deneme1', disabled: true, click: function (e) { throw ' Hata aldım'; } },
			{ divider: true },
			{
				title: 'Deneme3', disabled: true, click: function (e) { alert("ok"); }, items: [
					{ title: 'Sub 1', click: function (e) { alert("ok"); } },
					{
						title: 'Sub 2', click: function (e) { alert("ok"); }, items: [
							{ title: 'Sub 2-1', click: function (e) { alert("ok"); } },
					{ title: 'Sub 2-2', click: function (e) { alert("ok"); } }
						]
					}
				]
			},
			{ title: 'Deneme4', enable: true, click: function (s) { alert("ok"); } }
		]
	};
	if (parameters)
		$.extend(that.defaults, parameters);

	this.contextId = undefined;
	var buildSubMenu = function (parent, menu) {
		if (menu.divider)
			return $("<li class='divider'></li>").appendTo(parent);

		var m = $("<li class='dropdown-menu-item'><a tabindex='-1' href='#'></a></li>");
		if (menu.items != undefined && menu.items.length > 0) {
			m = $("<li class='dropdown-submenu'><a tabindex='-1' href='#'></a><ul class='dropdown-menu' /></li>");
			if (menu.icon)
				$('<span class="k-icon {0}"></span>'.format(menu.icon)).appendTo(m.children("a"));
			else
				$('<span class="k-icon k-icon-empty"></span>').appendTo(m.children("a"));
			m.children("a").append(menu.title);
			if (menu.css)
				m.attr("style", menu.css);
			for (var i = 0; i < menu.items.length; i++) {
				var subM = buildSubMenu(m.find("ul.dropdown-menu"), menu.items[i]);
			}
		} else {
			m.find("a").on("click", function (e) {
				if (m.hasClass("disabled"))
					return false;
				e.target = that.target;
				if ($.isFunction(menu.click))
					menu.click.call(this, e);
			});
			if (menu.css)
				m.attr("style", menu.css);
			if (menu.icon)
				$('<span class="k-icon {0}"></span>'.format(menu.icon)).appendTo(m.children("a"));
			else
				$('<span class="k-icon k-icon-empty"></span>').appendTo(m.children("a"));
			m.children("a").append(menu.title);
		}
		if (menu.disabled)
			m.addClass("disabled");

		m.appendTo(parent);
		return m;
	};
	var buildHtml = function () {
		that.contextId = isNullOrEmpty(that.defaults.id) ? 'c' + Guid() : that.defaults.id;
		var table = $("<div class='contextmenu' style='display:none'>" +
		"<div class='dropdown clearfix'>" +
			"<ul class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'></ul></div></div>");
		table[0].id = that.contextId;
		var menu = table.find("ul.dropdown-menu");
		for (var i = 0; i < that.defaults.items.length; i++) {
			buildSubMenu(menu, that.defaults.items[i]);
		}
		table.css("display", "none");
		return table;
	};

	var cElement = buildHtml();
	this.element = function () { return $(that.defaults.selector); };
	this.contextElement = cElement;
	function gridContextClick(item) {
		try {
			var gr = $(item).parents(".k-widget.k-grid:first").getKendoGrid();
			if (gr != undefined)
				gr.select(item);
		} catch (e) {
		}
	}
	(function () {
		$(that.contextElement).appendTo(document.body);

		$(document).on("contextmenu", that.defaults.selector, function (e) {
			$(".contextmenu").css("display", "none");
			that.target = e.currentTarget;
			if (this.tagName === "TR" && $(this).attr("data-uid") != undefined) {
				gridContextClick(this);
			}
			var x = e.clientX;
			var y = e.clientY;
			var h = that.contextElement.height();
			var w = that.contextElement.width()
			var dH = $(document).height();
			var dW = $(document).width();
			if ((dH - 15) <= (y + h))
				y = y - h;
			if ((dW - 10) <= (x + w))
				x = x - w;
			that.contextElement.css({ top: y + 5, left: x + 5, position: 'fixed', display: 'block' });
			$(document).one("click", function () {
				that.contextElement.css({ display: 'none' });
			});
			$(document).one("contextmenu", function () {
				//	that.contextElement.css({ display: 'none' }); 
			});
			return false;
		});
		that.element().data("bootstrapContextMenu", that);
	})();
	this.destroy = function () {
		that.contextElement.remove();
		that.element().removeData("bootstrapContextMenu");
		return true;
	};
	return that;
};
(function ($, window, document, undefined) {
	$.fn.bootstrapContextMenu = function () {

		var selector = $(this).selector;
		if (isNullOrEmpty(selector)) {
			var guid = "c" + Guid();
			$(this).attr("data-context-id", guid);
			selector = "[data-context-id=" + guid + "]";
		}
		if ($(this).data().bootstrapContextMenu != undefined)
			return $(this).data().bootstrapContextMenu;
		var defs = arguments;
		if (arguments.length > 0)
			defs = arguments[0];
		else
			defs = {};
		defs.selector = selector;
		return new bootstrapContextMenu(defs);
	}
	$.fn.getbootstrapContextMenu = function () {
		return $(this).data().bootstrapContextMenu;
	};
})(jQuery, window, document, undefined);