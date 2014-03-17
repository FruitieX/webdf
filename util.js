var setCenterprint = function(s) {
	clearTimeout(centerprintTimeout);
	$("#centerprint").text(s);
	centerprintTimeout = setTimeout(function() {
		$("#centerprint").text("");
	}, 3000);
};
