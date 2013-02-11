/**
* SE ENCARGA DE TODO LO RELACIONADO CON EL ESTILO
*/
//var resultados = $.mobile.path.parseUrl("http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&action=vehiculos");

var datos = [];
var tipos = [];
var asesores = [];
var sucursales = [];
var table = '';

var params = 'js/testdata.json';
//var params = 'http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&&action=vehiculos';

$(window).unload(function(){
	//alert('adios');
});

$(document).bind('mobileinit',function(){
	$.mobile.selectmenu.prototype.options.nativeMenu = true;
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

	//funcion de buscar
	Buscar();

	//CARGA DATOS GUARDADOS
	//loader
	$.mobile.showPageLoadingMsg();
	
	Cargar();
	Selects();

	$.mobile.hidePageLoadingMsg();
});

/**
* SINCRONIZA OBTIENE DATOS
*/
function Sincronizar(){
	var username = $("#username").val();
	var password = $("#password").val();

	var queryParams = '&username='+username+"&password="+password;

	if( !Validar(username) && !Validar(password) ){
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
			//GUARDA DATOS
			localStorage['datos'] = JSON.stringify(data);;

			//actualiza la hora de la ultima sincronizacion
			if( !jQuery.isEmptyObject(localStorage['datos']) > 0 ){
				var date = new Date();
				
				var horas = date.getHours();
				var minutos = date.getMinutes();
				var ampm = horas >= 12 ? 'pm' : 'am';
				horas = horas % 12;
				horas = horas ? horas : 12; 
				minutos = minutos < 10 ? '0'+minutos : minutos;

				localStorage['lastUpdate'] = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()+" - "+horas+":"+minutos+ampm;

			}

			//CARGA LOS DATOS
			Cargar();
			
			//ELIMINA DUPLICADOS PARA SELECTS
			EliminarDuplicados();

			//compone los selects
			Selects();
		},
		fail: function(response){
			var error = '<h2>Ha ocurrido un error al incronizar</h2>'+
						'<fieldset class="ui-grid-a">'+
							'<div class="ui-block-a" >'+
								'<button type="button" class="cancelar-dialogo" >'+
									'Cancel'+
								'</button>'+
							'</div>'+
							'<div class="ui-block-b">'+
								'<a clas="reintentar" type="submit" href="#sincronizar" data-rel="dialog" data-transition="slideup" >'+
									'Re intentar'+
								'</a>'+
							'</div>'+   
						'</fieldset>';
			Error('Error Sincronizar', error);
		}
	}).done(function(){
		$.mobile.hidePageLoadingMsg();
		$('.ui-dialog').dialog('close');
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
* CARGA LOS DATOS EN LA TABLA
* datos -> object con los datos a cargar
*/
function Cargar(){
	datos = JSON.parse(localStorage['datos']);

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
		asesores.push(c.ESTADO);
		sucursales.push(c.SUCURSAL);
	});
	
	$("#resultados tbody").html('');
	$("#resultados tbody").append(table).trigger('create');
	//$("#resultados").table( "refresh" );
	
	//actualiza la ultima hora de sincronizacion
	if(localStorage.getItem("lastUpdate") === null){
		$("#home-footer h3")
			.hide()
			.html("Debes Sincronizar")
			.fadeIn();
	}else{
		$("#home-footer h3")
			.hide()
			.html("Ultima actualizacion: "+localStorage['lastUpdate'])
			.fadeIn();
	}
	
	//funciones de la tabla
	$("#resultados tbody tr").each(function(){
		$(this).click(function(){
			InfoPage($(this).attr('id'));
		});
	});
	
}

/**
* ELIMINA DUPLICADOS DE LOS DATOS PARA SELECTS
* COMPONE EL ARRAY PARA SELECTS
*/
function EliminarDuplicados(){
	//elimina elementos duplicacos
	tipos = tipos.filter(function(elem, pos) {
		return tipos.indexOf(elem) == pos;
	});
	localStorage['tipos'] = JSON.stringify(tipos);

	asesores = asesores.filter(function(elem, pos) {
		return asesores.indexOf(elem) == pos;
	});
	localStorage['asesores'] = JSON.stringify(asesores);

	sucursales = sucursales.filter(function(elem, pos) {
		return sucursales.indexOf(elem) == pos;
	});
	localStorage['sucursales'] = JSON.stringify(sucursales);

	//funciones para el filtrado
	Tipos();
}

/**
* CARGA LOS FILTROS
* USA EL localStorage PARA OBTENER LOS DATOS
*/
function Selects(){
	tipos = JSON.parse(localStorage['tipos']);
	$.each(tipos, function(c, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-tipo").append(option);
	});
}

/**
* CARGA INFORMACION EN INFO PAGE
* id -> id de la info
*/
function InfoPage(id){
	//var datos = resultados.id;
	//alert(id);
	$.mobile.changePage('#info', { transition: "slide"} );
}

/************************* FILTROS ******************/

/**
* BUSQUEDA
*/
function Buscar(){
	//permite mostrar todos al borrar o resetear la busqueda
	$("#buscar").change(function(){
		if( $(this).val() == '' ){
			$("#resultados tbody").removeClass('no');
        	$("#resultados tbody").removeClass('si');
        	$("#resultados tbody tr").show();
		}
	});
	//busca en la tabla, solo en el tbody
	$("#buscar").keyup(function(){

		var busqueda = $("#buscar").val();
		busqueda = busqueda.replace(/\s/g, ""); //quita espacios en blanco
		busqueda = busqueda.split(","); //compone array separando por las comas
		busqueda = busqueda, count = 0;

		//recorre opciones para buscar
        $("#resultados tbody tr").each(function(){
        	var element = $(this);

        	$.each(busqueda,function(fila, valor){

        		//busqueda
        		if(element.text().search(new RegExp(valor, "i")) < 0 ){
	                
	                element.hide();
	                
	                if( !element.hasClass('si') ){
		 				element.addClass('no');	                	
	                }

	            //muestra considencias
	            } else {

	            	if( !element.hasClass('no') ){
	            		element.show();
	                	count++;
	            	}else{
	            		element.removeClass('no');
	            		element.addClass('si');
	            	}
	            }
        	});

        });
        $("#resultados tbody").removeClass('no');
        $("#resultados tbody").removeClass('si');
	});
}

/**
* FILTRA SELECION DE TIPOS
*/
function Tipos(){
	$("#select-tipos").change(function(){
		console.log('cambio tipos');
		alert( $(this).find("option:selected").val() );
	});
}

/**
* FILTRA SELECCION DE ESTADOS
*/
function Estados(){

}

/************************* HELPES *******************/

/**
* MUESTRA UN MENSAJE DE ERROR GENERICO
*/
function Error(title,content){
	$("#error div[data-role='header'] h1").html(title).trigger( "create" );
	$("#error div[data-role='content']").html(content).trigger( "create" );
	
	$.mobile.changePage('#error', {role:'dialog'});

	$('.cancelar-dialogo').click(function(){
		$('.ui-dialog').dialog('close');
	});
	
	$('.reintentar').click(function(){
		$('.ui-dialog').dialog('close');
	});
}