var rate = null;
var from = null;
var to = null;

getRate = function() {	
	$('#result').html("<small>getting data...</small>");
	// Getting Values
	from = $('#from').val();
	to = $('#to').val();
	url = "http://rate-exchange.appspot.com/currency?from=" + from + "&to=" + to + "&calback=jsonpCallback";
	$.ajax({
	url: url,
	type: "POST",
	async: false,
	dataType: "jsonp",
	success : function(data) 
	{

		rate = parseFloat(data.rate);
		showConvertion(to);
	}
	});
};

showConvertion = function(to){
	var amount = $('#amount').val();
	result = amount * rate;
	if (rate) {
		$('#result').html("<div id='currency'><span>"+ to +"</span></div><div id='result_value'><p>" + result.toFixed(2)+ "</p></div>");
	};
	if (!rate && (from == to)) {
		$('#result').html("<div id='currency'><span>"+ to +"</span></div>"+amount+"<small><i> of course! :P</i></small>");
	};
};

$(document).ready(function (){ getRate(); });
$('#from, #to').change(function (){	getRate(); });
$('#amount').keyup(function (){
	showConvertion(to);
	if ($('#result_value p').width() > $('#result_value').width()) {
		while( $('#result_value p').width() > $('#result_value').width() ) {
			$('#result_value p').css('font-size', (parseInt($('#result_value p').css('font-size'))) - 1 );
		};
	};
	
});