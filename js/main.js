/**
* SE ENCARGA DE TODO LO RELACIONADO CON EL ESTILO
*/
//var resultados = $.mobile.path.parseUrl("http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&action=vehiculos");

var datos = [];
var tipos = [];
var estados = [];
var asesores = [];
var sucursales = [];
var table = '';
var reservas = [];

/*************************** PHONEGAP **********************/

//espera que cordova cargue
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	console.log('device ready');

	$('.cancelar-dialogo').click(function(){
		$('.ui-dialog').dialog('close');
	});

	$("#resultados tr").each(function(){
		$(this).click(function(){
			InfoPage($(this).attr('id'));
		});
	});

	$("#consultar").click(function(){
		Consultar();
	});

	$("#sincronizar-boton, #bienvenida-sincronizar").click(function(){
		Sincronizar();
	});
	
	//FILTROS
	//Buscar();
	Tipos();
	Estados();
	Asesores();
	Sucursales();

	//CARGA LOS DATOS
	Consultar();

}

/************************** JQUERY *********************/

//var link = 'js/testdata.json';
//var link = 'http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&&action=vehiculos';
var link = 'http://77digital.digimoblabs.com/webServiceJsonTest2.php';

$(document).bind('mobileinit',function(){
	$.mobile.selectmenu.prototype.options.nativeMenu = true;
	$.mobile.fixedToolbars.hide(true);
});


$(document).ready(function(){
	onDeviceReady();
	/*
	$('.cancelar-dialogo').click(function(){
		$('.ui-dialog').dialog('close');
	});

	$("#resultados tr").each(function(){
		$(this).click(function(){
			InfoPage($(this).attr('id'));
		});
	});

	$("#consultar").click(function(){
		Consultar();
	});

	$("#sincronizar-boton").click(function(){
		Sincronizar();
	});
	
	//FILTROS
	Buscar();
	Tipos();
	Estados();
	Asesores();
	Sucursales();

	//CARGA LOS DATOS
	Consultar();
	*/
});


/**
* REFRESCA LOS DATOS
*/
function Consultar(){
	//si tiene datos los carga
	if( window.localStorage.getItem("datos") === null ){
		$.mobile.changePage('#sincronizar', {role:'dialog', transition: "slideup"});
	}else{
		//loader
		$.mobile.showPageLoadingMsg();
		
		Cargar();
		Selects();

		$.mobile.hidePageLoadingMsg();
	}
}

/**
* SINCRONIZA OBTIENE DATOS
*/
function Sincronizar(){
	var username = $("#username").val();
	var password = $("#password").val();

	var queryParams = '&username='+username+"&password="+password;

	if( !Validar(username) && !Validar(password) ){
		alert('Por favor increse las credenciales');
		return;
	}else{
		if( !ValidaCredenciales(username, password) ){
			alert('Credenciales Invalidas');
			return;
		}
	}
	//$.mobile.showPageLoadingMsg();
	$.mobile.loading( 'show', {
		text: 'Por favor espere',
		textVisible: true,
		theme: 'z',
		html: ""
	});
	
	//link = 'js/testreservas.json';
	var paramsRervas = {"username" : username, "password" : password, "action" : "reservas"};
	$.ajax({
		url: link,
		data: paramsRervas,
		type: 'get',
		crossDomain: true,
		//jsonpCallback : "Datos",
		async: true,
		contentType: "application/json; charset=utf-8",
        dataType: "json",
		cache: false,
		beforeSend: function(){
			console.log('peticion reservas');
		},
		success: function(reservas){
			window.localStorage.setItem( 'reservas', JSON.stringify(reservas) );
			console.log('reservas listas');
		},
		fail: function(response){
			var error = '<h2>Ha ocurrido un error al incronizar las reservas</h2>'+
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
		},
		error: function(response){
			console.log(response);
			var error = '<h2>Ha ocurrido un error al incronizar las reservas</h2>'+
						'<h2>Error en ajax</h2>'+response+
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
	});

	//link = 'js/testdata.json';
	var paramsDatos = {"username" : username, "password" : password, "action" : "vehiculos"};
	$.ajax({
		url: link,
		data: paramsDatos,
	    type: 'get',
	    crossDomain: true,
	    async: true,
		contentType: "application/json; charset=utf-8",
        dataType: "json",
		cache: false,
		success: function(data){
			console.log(data);

			//GUARDA DATOS
			window.localStorage.setItem( 'datos', JSON.stringify(data) );
			console.log('datos listos');

			//actualiza la hora de la ultima sincronizacion
			if( !jQuery.isEmptyObject(localStorage['datos']) > 0 ){
				var date = new Date();
				
				var horas = date.getHours();
				var minutos = date.getMinutes();
				var ampm = horas >= 12 ? 'pm' : 'am';
				horas = horas % 12;
				horas = horas ? horas : 12; 
				minutos = minutos < 10 ? '0'+minutos : minutos;

				var ahora = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()+" - "+horas+":"+minutos+ampm;
				window.localStorage.setItem( "lastUpdate", ahora );
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
		},
		error: function(response){
			console.log(response);
			var error = '<h2>Ha ocurrido un error al sincronizar los datos</h2>'+
						'<h2>Error en ajax</h2>'+
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

function Datos(datos){
	console.log('datos obtenidos');
	console.log(datos);
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
* VALIDA CREDENCIALES
*/
function ValidaCredenciales(username, password){
	if( username === 'IPURDY' && password === 'GPM2013' ){
		return true;
	}else if( username === 'IPURDYL' && password === 'LEXUS2013' ){
		return true;
	}else if( username === 'IPURDYPM' && password === 'PMCR2013' ){
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
	datos = JSON.parse( window.localStorage.getItem('datos') );

	//carga la datbla sin filtrar
	$.each(datos.INFOUNIDAD, function(f, c){
		
		var clase = c.TIPO_VEHICULO+' '+c.ESTADO+' ';
		if( !jQuery.isEmptyObject(c.NOMBRE_VENDEDOR) ){
			clase += c.NOMBRE_VENDEDOR+' ';
		}
		if( !jQuery.isEmptyObject(c.SUCURSAL) ){
			clase += c.SUCURSAL;
		}

		//compone la fila
		var tr = '<tr id="'+c.UNIDAD+'" class="'+clase+'">'+
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
			sucursales.push(c.SUCURSAL);
		}
			tr	+='</td>'+
				'</tr>';
				
			table += tr;

		tipos.push(c.TIPO_VEHICULO);
		if( !jQuery.isEmptyObject(c.NOMBRE_VENDEDOR) ){
			asesores.push(c.NOMBRE_VENDEDOR);
		}
		//sucursales.push(c.SUCURSAL);
	});
	
	$("#resultados tbody").html('');
	$("#resultados tbody").append(table).trigger('create');
	//$("#resultados").table( "refresh" );
	
	//actualiza la ultima hora de sincronizacion
	if( window.localStorage.getItem("lastUpdate") === null ){
		$("#home-footer h3, #info-footer h3")
			.hide()
			.html("Sin Sincronizar")
			.fadeIn();
	}else{
		$("#home-footer h3, #info-footer h3")
			.hide()
			.html("Ultima actualizacion: "+ window.localStorage.getItem('lastUpdate') )
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
	tipos.sort();
	window.localStorage.setItem( 'tipos', JSON.stringify(tipos) );

	asesores = asesores.filter(function(elem, pos) {
		return asesores.indexOf(elem) == pos;
	});
	asesores.sort();
	window.localStorage.setItem( 'asesores', JSON.stringify(asesores) );

	sucursales = sucursales.filter(function(elem, pos) {
		return sucursales.indexOf(elem) == pos;
	});
	sucursales.sort();
	window.localStorage.setItem( 'sucursales', JSON.stringify(sucursales) );
}

/**
* CARGA LOS FILTROS
* USA EL localStorage PARA OBTENER LOS DATOS
*/
function Selects(){
	//defaults
	$("#select-tipo").append('<option value="todos">Todos</option>');
	$("#select-asesor").append('<option value="todos">Todos</option>');

	tipos = JSON.parse( window.localStorage.getItem('tipos') );
	$.each(tipos, function(f, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-tipo").append(option);
	});

	asesores = JSON.parse( window.localStorage.getItem('asesores') );
	$.each(asesores, function(f, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-asesor").append(option);
	});

	sucursales = JSON.parse( window.localStorage.getItem('sucursales') );
	$.each(sucursales, function(f, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-sucursal").append(option);
	});
}

/************************* FILTROS ******************/

/**
* BUSQUEDA
*/
function Buscar(){
	//permite mostrar todos al borrar o resetear la busqueda
	/*$("#buscar").change(function(){
		if( $(this).val() == '' ){
			$("#resultados tbody").removeClass('no');
        	$("#resultados tbody").removeClass('si');
        	$("#resultados tbody tr").show();
		}
	});*/

	$.mobile.showPageLoadingMsg();
	
	//busca en la tabla, solo en el tbody
	$("#buscar").change(function(){
		if( $(this).val() == '' ){
			$("#resultados tbody").removeClass('no');
        	$("#resultados tbody").removeClass('si');
        	$("#resultados tbody tr").show();
        	return;
		}

		var busqueda = $("#buscar").val();
		busqueda = busqueda.replace(/\s/g, ""); //quita espacios en blanco
		busqueda = busqueda.split(","); //compone array separando por las comas
		busqueda = busqueda, count = 0;

		//recorre opciones para buscar
        $("#resultados tbody tr").each(function(){
        	var element = $(this);

        	$.each(busqueda,function(fila, valor){

        		//busqueda
        		if( element.text().search(new RegExp(valor, "i")) < 0 ){
	                
	                element.hide();
	                
	                /*if( !element.hasClass('si') ){
		 				element.addClass('no');	                	
	                }*/

	            //muestra considencias
	            } else {
	            	element.show();

	            	/*if( !element.hasClass('no') ){
	            		element.show();
	                	count++;
	            	}else{
	            		element.removeClass('no');
	            		element.addClass('si');
	            	}*/
	            }
        	});

        });
        $("#resultados tbody").removeClass('no');
        $("#resultados tbody").removeClass('si');
	});
	$.mobile.hidePageLoadingMsg();
}

/**
* FILTRA SELECION DE TIPOS
*/
function Tipos(){
	$("#select-tipo").change(function(){
		var tipo = $(this).find("option:selected").val();

		//muestra todos los tipos
		if( tipo == 'todos' ){
			var tipos = window.localStorage.getItem('tipos');
			$.mobile.showPageLoadingMsg();
			
			$.each(tipos, function(f, valor){
				$("."+valor).show();
			});

			$.mobile.hidePageLoadingMsg();
			return;
		}

		$.mobile.showPageLoadingMsg();
		$("#resultados tbody tr").each(function(){
			if( $(this).hasClass(tipo) ){
				$(this).show();
			}else{
				if( $(this).is(":visible") ){
					$(this).hide();
				}
			}
		});
		$.mobile.hidePageLoadingMsg();
	});
}

/**
* FILTRA SELECCION DE ESTADOS
*/
function Estados(){
	$("#select-estado").change(function(){
		var estado = $(this).find("option:selected").val();

		//mustra todos los estados
		if( estado == 'todos' ){
			var estados = window.localStorage.getItem('estados');

			$.mobile.showPageLoadingMsg();
			$.each(estados, function(f, valor){
				$("."+valor).show();
			});
			$.mobile.hidePageLoadingMsg();
		}

		if( estado == 'disponible'){
			$.mobile.showPageLoadingMsg();
			$("#resultados tbody tr").each(function(){
				if( $(this).hasClass('S') || $(this).hasClass('ST') || $(this).hasClass('L') || $(this).hasClass('T')){
					$(this).show();
				}else{
					if( $(this).is(":visible") ){
						$(this).hide();
					}
				}
			});
			$.mobile.hidePageLoadingMsg();
		}
		if( estado == 'disponibleInventario'){
			$.mobile.showPageLoadingMsg();
			$("#resultados tbody tr").each(function(){
				if( $(this).hasClass('S') || $(this).hasClass('L') ){
					$(this).show();
				}else{
					if( $(this).is(":visible") ){
						$(this).hide();
					}
				}
			});
			$.mobile.hidePageLoadingMsg();
		}
		if( estado == 'libre'){
			$.mobile.showPageLoadingMsg();
			$("#resultados tbody tr").each(function(){
				if( $(this).hasClass('L') || $(this).hasClass('T') ){
					$(this).show();
				}else{
					if( $(this).is(":visible") ){
						$(this).hide();
					}
				}
			});
			$.mobile.hidePageLoadingMsg();
		}
		if(estado == 'libreInventario'){
			$.mobile.showPageLoadingMsg();
			$("#resultados tbody tr").each(function(){
				if( $(this).hasClass('L') ){
					$(this).show();
				}else{
					if( $(this).is(":visible") ){
						$(this).hide();
					}
				}
			});
			$.mobile.hidePageLoadingMsg();
		}
		if( estado == 'separado'){
			$.mobile.showPageLoadingMsg();
			$("#resultados tbody tr").each(function(){
				if( $(this).hasClass('S') || $(this).hasClass('ST') ){
					$(this).show();
				}else{
					if( $(this).is(":visible") ){
						$(this).hide();
					}
				}
			});
			$.mobile.hidePageLoadingMsg();
		}
		if( estado == 'separadoInventario'){
			$.mobile.showPageLoadingMsg();
			$("#resultados tbody tr").each(function(){
				if( $(this).hasClass('S') ){
					$(this).show();
				}else{
					if( $(this).is(":visible") ){
						$(this).hide();
					}
				}
			});
			$.mobile.hidePageLoadingMsg();
		}
	});
}

/**
* FILTRA SELECCION
*/
function Asesores(){
	$("#select-asesor").change(function(){
		var asesor = $(this).find("option:selected").val();
		alert(asesor);

		//muestra todos los tipos
		if( asesor == 'todos' ){
			var asesores = window.localStorage.getItem('asesores');
			$.mobile.showPageLoadingMsg();
			
			$.each(asesores, function(f, valor){
				$("."+valor).show();
			});

			$.mobile.hidePageLoadingMsg();
			return;
		}

		$.mobile.showPageLoadingMsg();
		$("#resultados tbody tr").each(function(){
			if( $(this).hasClass(asesor) ){
				$(this).show();
			}else{
				if( $(this).is(":visible") ){
					$(this).hide();
				}
			}
		});
		$.mobile.hidePageLoadingMsg();
	});
}

/**
* FILTRO PARA SELECCION DE SUCURSAL
*/
function Sucursales(){
	$("#select-sucursal").change(function(){
		var sucursal = $(this).find("option:selected").val();

		//muestra todos los tipos
		if( sucursal == 'todos' ){
			var sucursal = window.localStorage.getItem('sucursales');
			$.mobile.showPageLoadingMsg();
			
			$.each(sucursal, function(f, valor){
				$("."+valor).show();
			});

			$.mobile.hidePageLoadingMsg();
			return;
		}

		$.mobile.showPageLoadingMsg();
		$("#resultados tbody tr").each(function(){
			if( $(this).hasClass(sucursal) ){
				$(this).show();
			}else{
				if( $(this).is(":visible") ){
					$(this).hide();
				}
			}
		});
		$.mobile.hidePageLoadingMsg();
		
		/*var opciones = [];
		opciones.push = $(this).find("option:selected").val();
		opciones.push = $("#select-asesor").find("option:selected").val();
		opciones.push = $("#select-tipo").find("option:selected").val();
		opciones.push = $("#select-estado").find("option:selected").val();
		Filtrar(opciones)*/
	});
}

/**
* FILTRA CON LAS OPCIONES SELECCIONADAS
*/
function Filtrar(opciones){
	$.mobile.showPageLoadingMsg();
	$("#resultados tbody tr").each(function(){
		var element = $(this);
		
		$.each(opciones, function(f, opcion){
			if( element.hasClass(opcion) ){
				element.addClass('si');
				element.show();
			}else{
				if( !element.hasClass('si') ){
					element.hide();
				}
			}
		});
			
	});
	$.mobile.hidePageLoadingMsg();
}

/************************* PAGINA DE INFORMACION ***************************/

/**
* CARGA INFORMACION EN INFO PAGE
* id -> id de la info
*/
function InfoPage(id){
	//var datos = resultados.id;
	//alert(id);
	$.mobile.changePage('#info', { transition: "slide"} );

	reservas = JSON.parse( window.localStorage.getItem('reservas') );

	$.each(reservas.INFOUNIDAD, function(f, c){
		if( c.UNIDAD === id ){
			$("#reserva").html('<b class="ui-table-cell-label">Reserva</b>'+c.FECHA_RESERVACION).trigger('create').trigger('create');
			$("#entrega").html('<b class="ui-table-cell-label">Entrega</b>'+c.FECHA_ENTREGA).trigger('create').trigger('create');
			$("#dias-reserva").html('<b class="ui-table-cell-label">Días Reserva</b>'+c.FECHA_ENTREGA).trigger('create').trigger('create');
			$("#cliente").html('<b class="ui-table-cell-label">Cliente</b>'+c.NOMBRE_CLIENTE).trigger('create').trigger('create');
			$("#vendedor").html('<b class="ui-table-cell-label">Vendedor</b>'+c.NOMBRE_VENDEDOR).trigger('create').trigger('create');
			$("#sucursal").html('<b class="ui-table-cell-label">Sucursal</b>'+c.SUCURSAL).trigger('create').trigger('create');
		}
	});

	datos = JSON.parse( window.localStorage.getItem('datos') );

	$.each(datos.INFOUNIDAD, function(f,c){
		if( c.UNIDAD === id ){
			$("#unidad").html('<b class="ui-table-cell-label">Unidad</b>'+c.UNIDAD).trigger('create').trigger('create');
			$("#precio").html('<b class="ui-table-cell-label">Precio</b>'+c.PRECIO).trigger('create').trigger('create');
			$('#tipo-vehiculo').html('<b class="ui-table-cell-label">Tipo Vehiculo</b>'+c.TIPO_VEHICULO).trigger('create');
			$('#color').html('<b class="ui-table-cell-label">Color</b>'+c.DESC_COLOR_EXT).trigger('create');
			$('#codigo-color').html('<b class="ui-table-cell-label">Código Color</b>'+c.COLOR_EXTERNO).trigger('create');
			$('#ano-modelo').html('<b class="ui-table-cell-label">Año Modelo</b>'+c.MODELO).trigger('create');
			$('#ubicacion').html('<b class="ui-table-cell-label">Ubicacion</b>'+c.DESC_UBICACION).trigger('create');
			$('#fecha-llegada').html('<b class="ui-table-cell-label">Fecha Llegada</b>'+c.FECHA_LLEGADA).trigger('create');
			$('#equipamiento').html('<b class="ui-table-cell-label">Equipamiento</b>'+c.EQUIPAMIENTO).trigger('create');
			$('#extras-instaladas').html('<b class="ui-table-cell-label">Extras Instaladas</b>'+c.EXTRAS_INSTALADAS).trigger('create');
			
			if( !jQuery.isEmptyObject(c.NOTAS) ){
				$('#notas').html('<b class="ui-table-cell-label">Notas</b>'+c.NOTAS).trigger('create');
			}
		}
	});
}

/************************* HELPES *******************/

/**
* MUESTRA UN MENSAJE DE ERROR GENERICO
*/
function Error(title, content){
	$("#error div[data-role='header'] h1").html(title).trigger( "create" );
	$("#error div[data-role='content']").html(content).trigger( "create" );
	
	$.mobile.changePage('#error', {role:'dialog'});

	$('.cancelar-dialogo').click(function(){
		//$('.ui-dialog').dialog('close');
	});
	
	$('.reintentar').click(function(){
		//$('.ui-dialog').dialog('close');
	});
}