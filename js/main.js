/**
* SE ENCARGA DE TODO LO RELACIONADO CON EL ESTILO
*/
//var resultados = $.mobile.path.parseUrl("http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&action=vehiculos");

var tipos = [];
var estados = [];
var asesores = [];
var sucursales = [];
var table = '';

var params = 'js/testdata.json';
//var params = 'http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&&action=vehiculos';

$(document).bind('mobileinit',function(){
	//$.mobile.selectmenu.prototype.options.nativeMenu = false;
	$.mobile.fixedToolbars.hide(true);
});

$(document).ready(function(){
	
	$('.cancelar-dialogo').click(function(){
		$('.ui-dialog').dialog('close');
	});

	$("#resultados tr").each(function(){
		$(this).click(function(){
			InfoPage($(this).attr('id'));
		});
	});
	
	$("#form-sincronizar").live('submit',function(event){
		event.preventDefault();
    	event.stopPropagation();
		alert('no envia');
		return false;
	});

	$("#sincronizar-boton").click(function(){
		Sincronizar();
	});
});

/**
* CARGA LOS DATOS GUARDADOS
*/
function Data(){
	if(true){

	}else{

	}
}

/**
* SINCRONIZA
*/
function Sincronizar(){
	var username = $("#username").val();
	var password = $("#password").val();

	var queryParams = '&username='+username+"&password="+password;

	if( !Validar(username) && !Validar(password) ){
		alert('datos invaliudos');
		return;
	}

	$.ajax({
		url: params,
	    type: 'get',
	    async: true,
		dataType: 'json',
		cache: true,
		beforeSend: function(){
			$.mobile.showPageLoadingMsg();
		},
		success: function(data){
			localStorage.resultados = data;

			if( !jQuery.isEmptyObject(localStorage.resultados) > 0 ){
				var date = new Date();
				
				var horas = date.getHours();
				var minutos = date.getMinutes();
				var ampm = horas >= 12 ? 'pm' : 'am';
				horas = horas % 12;
				horas = horas ? horas : 12; 
				minutos = minutos < 10 ? '0'+minutos : minutos;

				lastUpdate = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()+" - "+horas+":"+minutos+ampm;
				$("#home-footer h3")
				.hide()
				.html("Ultima actualizacion: "+lastUpdate)
				.fadeIn();

			}else{
				$("#home-footer h3").html("Ultima actualizacion: cookie");
			}

			Cargar(data);

			//carga la datbla sin filtrar
			/*$.each(data.INFOUNIDAD, function(f, c){
				//compone la fila
				var tr = '<tr id="'+c.UNIDAD+'">'+
							'<td><b class="ui-table-cell-label">Unidad</b>'+
								c.UNIDAD+'</td>'+
							'<td><b class="ui-table-cell-label">Color</b>'+c.DESC_COLOR_EXT+'</td>'+
							'<td><b class="ui-table-cell-label">Modelo</b>'+
								c.MODELO+'</td>'+
							'<td><b class="ui-table-cell-label">Fecha llegada</b>';
				
				if( jQuery.isEmptyObject(c.FECHA_LLEGADA) ){
					$.each(c.FECHA_LLEGADA, function(x,valor){
						tr += '---';
					})
				}else{
					tr += c.FECHA_LLEGADA;
				}
						tr	+='</td>'+
							'<td><b class="ui-table-cell-label">Cliente</b>';
				if( jQuery.isEmptyObject(c.NOMBRE_CLIENTE) ){
					tr += '---';
				}else{
					tr += c.NOMBRE_CLIENTE;
				}
						tr	+='</td>';

						tr	+='<td><b class="ui-table-cell-label">Sucursal</b>';
				//sucursal
				if( jQuery.isEmptyObject(c.SUCURSAL) ){
					tr += '---';
				}else{
					tr += c.SUCURSAL;
				}
						tr	+='</td>'+
						  '</tr>';
				
				table += tr;

				tipos.push(c.TIPO_VEHICULO);
			});*/
			
			//elimina elementos duplicados 
			EliminarDuplicados();

			//compone los selects
			Selects();

			$("#resultados tbody").append(table)
			//$("#resultados").table( "refresh" );
		},
		fail: function(){
			Error();
		}
	}).done(function(){
		$.mobile.hidePageLoadingMsg();

		$("#resultados tr").each(function(){
			$(this).click(function(){
				InfoPage($(this).attr('id'));
			});
		});
	});
}

/**
* VALIDA LOS INPUTS DE SINCRONIZAR
*/
function Validar(text){
	if( text != null && text != '' && text != undefined ){
		return true;
	}else{
		return false;
	}
}

/**
* ELIMINA DUPLICADOS DE LOS ARRAYS
*/
function EliminarDuplicados(){
	//elimina elementos duplicacos
	tipos = tipos.filter(function(elem, pos) {
		return tipos.indexOf(elem) == pos;
	});
	localStorage.tipos = tipos;

	/*
	estados = estados.filter(function(elem, pos) {
		return estados.indexOf(elem) == pos;
	});

	asesores = asesores.filter(function(elem, pos) {
		return asesores.indexOf(elem) == pos;
	});

	sucursales = sucursales.filter(function(elem, pos) {
		return sucursales.indexOf(elem) == pos;
	});
	*/
}

/**
* CARGA LOS DATOS EN LA TABLA
*/
function Cargar(datos){
	//datos = localStorage.resultados;
	
	//carga la datbla sin filtrar
	$.each(datos.INFOUNIDAD, function(f, c){
		//compone la fila
		var tr = '<tr id="'+c.UNIDAD+'">'+
					'<td><b class="ui-table-cell-label">Unidad</b>'+
						c.UNIDAD+'</td>'+
					'<td><b class="ui-table-cell-label">Color</b>'+c.DESC_COLOR_EXT+'</td>'+
					'<td><b class="ui-table-cell-label">Modelo</b>'+
						c.MODELO+'</td>'+
					'<td><b class="ui-table-cell-label">Fecha llegada</b>';
				
		if( jQuery.isEmptyObject(c.FECHA_LLEGADA) ){
			$.each(c.FECHA_LLEGADA, function(x,valor){
			tr += '---';
			})
		}else{
			tr += c.FECHA_LLEGADA;
		}
			tr	+='</td>'+
			'<td><b class="ui-table-cell-label">Cliente</b>';
		if( jQuery.isEmptyObject(c.NOMBRE_CLIENTE) ){
			tr += '---';
		}else{
			tr += c.NOMBRE_CLIENTE;
		}
		tr	+='</td>';

		tr	+='<td><b class="ui-table-cell-label">Sucursal</b>';
		//sucursal
		if( jQuery.isEmptyObject(c.SUCURSAL) ){
			tr += '---';
		}else{
			tr += c.SUCURSAL;
		}
			tr	+='</td>'+
				'</tr>';
				
			table += tr;

		tipos.push(c.TIPO_VEHICULO);
	});
}

/**
* CARGA LOS FILTROS
*/
function Selects(){

}

/**
* CARGA INFORMACION EN INFO PAGE
* id -> id de la info
*/
function InfoPage(id){
	//var datos = resultados.id;
	alert(id);
	$.mobile.changePage('#info', { transition: "slide"} );
}

/************************* HELPES *******************/

/**
* 
*/
function Error(){
	$.mobile.changePage('#error', {role:'dialog'});
}