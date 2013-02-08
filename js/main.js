/**
* SE ENCARGA DE TODO LO RELACIONADO CON EL ESTILO
*/

$(document).ready(function(){
	var alto = $('html').height() - ( $('.bottonset').innerHeight() + $(".selectors").innerHeight() );
	
	//alert(alto);

	$("#lista-consultas tbody").css({height:alto});


});
	
/**
* MUESTRA / OCULTA CONTENTs
*/
function colum2(){
	//si esta visible oculta
	if( $("#colum2").is(":visible") ){
		$("#colum1").css({"display":"inline-block"});

		$("#colum1").animate({
			width: "100%",
		}, { 
			duration: 1000, 
			queue: true,
			complete: function(){
			}
		});

		$("#colum2").animate({
			width: "0%",
		}, { 
			duration: 1000, 
			queue: true,
			complete: function(){
				$("#colum2").hide()
			}
		});

	}else{
		$("#colum2").css({"display":"inline-block"});

		$("#colum1").animate({
			width: "0%",
		}, { 
			duration: 1000, 
			queue: true,
			complete: function(){
				$("#colum1").hide();
			}
		});

		$("#colum2").animate({
			width: "100%",
		}, { 
			duration: 1000, 
			queue: true,
			complete: function(){
			}
		});

	}
}

/**
* CARGA LAS CONSULTAS
*/
function Consultas(){
	
}