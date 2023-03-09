/*
 * @Author: your name
 * @Date: 2021-09-29 14:24:00
 * @LastEditTime: 2021-09-29 14:31:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\html\static\js\wap端计算fontsize.js
 */
(function (doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = "orientationchange" in window ? "orientationchange" : "resize",
		recalc = function () {
			var clientWidth = docEl.clientWidth;
			if (!clientWidth) return;
			if (clientWidth<750){
				docEl.style.fontSize = 100 * (clientWidth / 750) + "px";
			}else{
				docEl.style.fontSize = "100px";
			}
		};
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc);
	doc.addEventListener('DOMContentLoaded', recalc);
})(document, window);