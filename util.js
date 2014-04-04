var setCenterprint = function(s) {
	clearTimeout(centerprintTimeout);
	$("#centerprint").text(s);
	centerprintTimeout = setTimeout(function() {
		$("#centerprint").text("");
	}, 3000);
};

Colors = [
	"00ffff",
	"f0ffff",
	"0000ff",
	"a52a2a",
	"00ffff",
	"5500ff",
	"008b8b",
	"006400",
	"bdb76b",
	"8b008b",
	"ff8c00",
	"9932cc",
	"8b0000",
	"e9967a",
	"9400d3",
	"ff00ff",
	"ffd700",
	"008000",
	"f0e68c",
	"add8e6",
	"e0ffff",
	"90ee90",
	"ffb6c1",
	"ffffe0",
	"00ff00",
	"ff00ff",
	"800000",
	"000080",
	"808000",
	"ffa500",
	"ffc0cb",
	"800080",
	"800080",
	"ff0000",
	"c0c0c0",
	"ffffff",
	"ffff00"
];

// brighten or darken a color
var modifyColor = function(color, multiplier) {
	var r = parseInt(color.substr(0, 2), 16);
	var g = parseInt(color.substr(2, 2), 16);
	var b = parseInt(color.substr(4, 2), 16);

	r += (255 - r) * multiplier * (r / 255);
	g += (255 - g) * multiplier * (g / 255);
	b += (255 - b) * multiplier * (b / 255);

	r = Math.floor(r);
	g = Math.floor(g);
	b = Math.floor(b);

	// pad with zeros
	color = ("00" + r.toString(16)).substr(-2) + ("00" + g.toString(16)).substr(-2) + ("00" + b.toString(16)).substr(-2);

	return color;
};

var colorFromName = function(name) {
	return ("000000" + parseInt(Colors[(parseInt(name, 33) % Colors.length)], 16)).substr(-6);
};

