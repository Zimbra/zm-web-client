
function darken(hex, amount) {
	var rgb = hex2rgb(hex);
	var darker = {};
	
	darker.r = Math.round(rgb.r * ((100-amount)/100));
	darker.g = Math.round(rgb.g * ((100-amount)/100));
	darker.b = Math.round(rgb.b * ((100-amount)/100));

	return rgb2hex(darker);
}

function lighten(hex, amount) {
	rgb = hex2rgb(hex);
	var lighter = {};
	
	lighter.r = Math.round(rgb.r + (255 - rgb.r) * (amount/100));
	lighter.g = Math.round(rgb.g + (255 - rgb.g) * (amount/100));
	lighter.b = Math.round(rgb.b + (255 - rgb.b) * (amount/100));

	return rgb2hex(lighter);
}


hexdig='0123456789abcdef';
function Dec2Hex(d) {
	return hexdig.charAt((d-(d%16))/16)+hexdig.charAt(d%16);
}
function Hex2Dec(h) {
	h=h.toLowerCase();
	d=0;
	for (i=0;i<h.length;i++) {
		d=d*16;
		d+=hexdig.indexOf(h.charAt(i));
	}
	return d;
}

function rgb2Hex(r,g,b) {
	return Dec2Hex(r)+Dec2Hex(g)+Dec2Hex(b);
}

// rgb2hsv and hsv2rgb are based on Color Match Remix [http://color.twysted.net/]
// which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
function hsv2rgb(hsv) {
	var rgb=new Object();
	if (hsv.saturation==0) {
		rgb.r=rgb.g=rgb.b=Math.round(hsv.value*2.55);
	} else {
		hsv.hue/=60;
		hsv.saturation/=100;
		hsv.value/=100;
		i=Math.floor(hsv.hue);
		f=hsv.hue-i;
		p=hsv.value*(1-hsv.saturation);
		q=hsv.value*(1-hsv.saturation*f);
		t=hsv.value*(1-hsv.saturation*(1-f));
		switch(i) {
		case 0: rgb.r=hsv.value; rgb.g=t; rgb.b=p; break;
		case 1: rgb.r=q; rgb.g=hsv.value; rgb.b=p; break;
		case 2: rgb.r=p; rgb.g=hsv.value; rgb.b=t; break;
		case 3: rgb.r=p; rgb.g=q; rgb.b=hsv.value; break;
		case 4: rgb.r=t; rgb.g=p; rgb.b=hsv.value; break;
		default: rgb.r=hsv.value; rgb.g=p; rgb.b=q;
		}
		rgb.r=Math.round(rgb.r*255);
		rgb.g=Math.round(rgb.g*255);
		rgb.b=Math.round(rgb.b*255);
	}
	return rgb;
}

function min3(a,b,c) { return (a<b)?((a<c)?a:c):((b<c)?b:c); }
function max3(a,b,c) { return (a>b)?((a>c)?a:c):((b>c)?b:c); }

function rgb2hsv(rgb) {
	hsv = new Object();
	max=max3(rgb.r,rgb.g,rgb.b);
	dif=max-min3(rgb.r,rgb.g,rgb.b);
	hsv.saturation=(max==0.0)?0:(100*dif/max);
	if (hsv.saturation==0) hsv.hue=0;
 	else if (rgb.r==max) hsv.hue=60.0*(rgb.g-rgb.b)/dif;
	else if (rgb.g==max) hsv.hue=120.0+60.0*(rgb.b-rgb.r)/dif;
	else if (rgb.b==max) hsv.hue=240.0+60.0*(rgb.r-rgb.g)/dif;
	if (hsv.hue<0.0) hsv.hue+=360.0;
	hsv.value=Math.round(max*100/255);
	hsv.hue=Math.round(hsv.hue);
	hsv.saturation=Math.round(hsv.saturation);
	return hsv;
}

function HueShift(h,s) {
	h+=s;
	while (h>=360.0) h-=360.0;
	while (h<0.0) h+=360.0;
	return h;
}


function hex2rgb(hex) {
	var r = Hex2Dec(hex.charAt(0) + hex.charAt(1));
	var g = Hex2Dec(hex.charAt(2) + hex.charAt(3));
	var b = Hex2Dec(hex.charAt(4) + hex.charAt(5));
	return {r: r, g: g, b:b};
}

function rgb2hex(rgb) {
	return Dec2Hex(rgb.r) + Dec2Hex(rgb.g) + Dec2Hex(rgb.b);
}

function hex2hsv(hex) {
	return rgb2hsv(hex2rgb(hex));
}

function hsv2hex(hsv) {
	return rgb2hex(hsv2rgb(hsv));
}