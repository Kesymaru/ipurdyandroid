/**
* SE ENCARGA DE TODO LO RELACIONADO CON EL ESTILO
*/
//var resultados = $.mobile.path.parseUrl("http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&action=vehiculos");

/************************************************************************************** CLASE PARA CARGAR DATOS ***********************************/

var tipos = [];
var estados = [];
var asesores = [];
var sucursales = [];

Cargar = function(){};
$.extend( Cargar.prototype, {
   datosLocales : false,

   //data local
   datos: [],
   table: '',

   init: function() {
   },

   Comfirmar: function(){
   		notifica.Confirmacion('Desear Recargar los datos', 'Recargar Datos', 'Si,No', cargar.Confirmado );
   },

   //confirma la recarga
   Confirmado: function(button){

   		if(button == 1 || button == '1'){
   			
   			if( !this.datosLocales ){
	   			if( window.localStorage.getItem("datos") === null ){
		   			this.datosLocales = false;
		   		}else{
		   			this.datosLocales = true;
		   		}
	   		}
	   		if( this.datosLocales ){	   			
	   			$.mobile.loading( 'show', {
					text: 'Recargando datos',
					textVisible: true,
					theme: 'a',
					html: ""
				});
	   		}

	   		//recarga datos
   			this.Cargar();

   			if( this.datosLocales ){
   				$.mobile.loading( 'hide' );
   			}
   		}else{
   			return;
   		}
   },
   
   //carga los datos
   Cargar: function() {

   		if( !this.datosLocales ){
   			if( window.localStorage.getItem("datos") === null ){
	   			this.datosLocales = false;
	   		}else{
	   			this.datosLocales = true;
	   		}
   		}

   		//si tiene datos locales
		if( this.datosLocales ){
			
			this.CargarDatos();
			this.UpdateTime();
			this.Duplicados();
			this.CargarSelects();

		}else{
			$.mobile.changePage('#sincronizar', {role:'dialog', transition: "slideup"});
		}
   },

   //carga los datos
   CargarDatos: function(){
   		console.log('cargando datos');
   		
   		var table = '';

	   	this.datos = JSON.parse( window.localStorage.getItem('datos') );

		//carga la datbla sin filtrar
		$.each( this.datos.INFOUNIDAD, function(f, c){

			var clase = c.TIPO_VEHICULO+' '+c.ESTADO+' ';
			if( !jQuery.isEmptyObject(c.NOMBRE_VENDEDOR) ){
				var vendedor = c.NOMBRE_VENDEDOR;
				vendedor = vendedor.replace(/\s+/g, ''); //elimina espacios en blanco
				clase += vendedor+' ';
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

			//sucursal
			tr	+='<td><b class="ui-table-cell-label">Sucursal</b>';
			if( jQuery.isEmptyObject(c.SUCURSAL) ){
				tr += '---';
			}else{
				tr += c.SUCURSAL;

				//array para las sucursales
				sucursales.push(c.SUCURSAL);
			}
				tr += '</td>';

			//dias reserva
			if( !jQuery.isEmptyObject(c.DIAS_RESERVA) ){
				tr +='<td><b class="ui-table-cell-label">Días Reserva</b>'+c.DIAS_RESERVA+'</td>';
			}else{
				tr +='<td><b class="ui-table-cell-label">Días Reserva</b>---</td>';
			}

			tr +=	'</tr>';
					
			table += tr;

			tipos.push(c.TIPO_VEHICULO);

			if( !jQuery.isEmptyObject(c.NOMBRE_VENDEDOR) ){
				asesores.push(c.NOMBRE_VENDEDOR);
			}
		});

		$("#resultados tbody").html(table).trigger('create');

		$("#resultados tbody tr").bind('tap swiperight', function(){
			detalles.Detalles( $(this).attr('id') );
		});
   },

   UpdateTime: function(){
   		//actualiza la ultima hora de sincronizacion
		if( window.localStorage.getItem("lastUpdate") === null ){
			$("#home-footer h3, #info-footer h3").html("Sin Sincronizar");
		}else{
			$("#home-footer h3, #info-footer h3").html("Ultima actualizacion: "+ window.localStorage.getItem('lastUpdate') );
		}
   },
   
   //elimina elementos duplicados
   Duplicados: function(){
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

	},

   CargarSelects: function(){
   		
   		//defaults
		$("#select-tipo").html('<option value="todos" selected>Todos</option>');
		$("#select-asesor").html('<option value="todos" selected>Todos</option>');
		$("#select-sucursal").html('<option value="todos" selected>Todos</option>');

		this.tipos = JSON.parse( window.localStorage.getItem('tipos') );
		$.each(this.tipos, function(f, valor){
			var option = '<option value="'+valor+'">'+valor+'</option>';
			$("#select-tipo").append(option);
		});

		this.asesores = JSON.parse( window.localStorage.getItem('asesores') );
		$.each(this.asesores, function(f, valor){
			var option = '<option value="'+valor+'">'+valor+'</option>';
			$("#select-asesor").append(option);
		});

		this.sucursales = JSON.parse( window.localStorage.getItem('sucursales') );
		$.each(sucursales, function(f, valor){
			var option = '<option value="'+valor+'">'+valor+'</option>';
			$("#select-sucursal").append(option);
		});

		//refresca
		$("#select-tipo, #select-asesor, #select-sucursal").selectmenu('refresh', true);
   },

});

/******************************************************************************** CLASE PARA FILTRO ***********************************/

Filtro = function(){};
$.extend( Filtro.prototype, {
	select : '',
	mostrado: false,
	superSelect: false,
	ultimoFiltro: '',
	noResultados: false,

	//inicializa los eventos
	init: function(){
		$("#select-tipo, #select-estado, #select-asesor, #select-sucursal").change(function(){
			filtro.Filtrar();
		});
	},

	//filtra
	Filtrar: function(){

		$.mobile.loading( 'show', {
			text: 'Filtrando',
			textVisible: true,
			theme: 'a',
			html: ""
		});
	
		if( this.noResultados ){
			$('#no-resultados').css('display','none');		
		}

		this.select = '';
		this.mostrado = false;

		var tipo = $("#select-tipo option:selected").val();
		var estado = $("#select-estado option:selected").val();
		var asesor = $("#select-asesor option:selected").val();
		asesor = asesor.replace(/\s+/g, ''); //elimina espacios blancos
		var sucursal = $("#select-sucursal option:selected").val();
		
		//compone el selector para el filtro	
		if( tipo != 'todos' ){
			this.select += '.'+tipo;
		}else if( !this.mostrado ){
			$("#resultados tbody tr").css('display','table-row');
			this.mostrado = true;
		}
		if( asesor != 'todos' ){
			this.select += '.'+asesor;
		}else if( !this.mostrado ){
			$("#resultados tbody tr").css('display','table-row');
			this.mostrado = true;
		}
		if( sucursal != 'todos'){
			this.select += '.'+sucursal;
		}else if( !this.mostrado ){
			$("#resultados tbody tr").css('display','table-row');
			this.mostrado = true;
		}
		
		this.superSelect = '';

		//compone seleccion con los estados
		switch (estado){
			case 'disponible':
				this.superSelect += '.S' +this.select+', ';
				this.superSelect += '.ST'+this.select+', ';
				this.superSelect += '.L'+this.select+', ';
				this.superSelect += '.T'+this.select;
				break;

			case 'disponibleInventario':
				this.superSelect += '.S' +this.select+', ';
				this.superSelect += '.L'+this.select;
				break;

			case 'libre':
				this.superSelect += '.L'+this.select+', ';
				this.superSelect += '.T'+this.select;
				break;

			case 'libreInventario':
				this.superSelect += '.L'+this.select;
				break;

			case 'separado':
				this.superSelect += '.S' +this.select+', ';
				this.superSelect += '.ST'+this.select;
				break;

			case 'separadoInventario':
				this.superSelect += '.S' +this.select;
				break;

			case 'todos':
				this.superSelect = this.select;
				if(!this.mostrado){
					$("#resultados tbody tr").css('display','table-row');
					this.mostrado = true;
				}
				break;
		}

		if( this.superSelect != '' ){
			//esconde todos
			$("#resultados tbody tr").css('display','none');
			
			console.log(this.superSelect);
			
			this.ultimoFiltro = $(this.superSelect);
			this.ultimoFiltro.css('display','table-row');
		}

		//si hay resultados
		if( !$("#resultados tbody tr").is(":visible") ){
			$('#no-resultados').css('display','block');
			this.noResultados = true;
		}

		$.mobile.hidePageLoadingMsg();
	}
});

/************************************************************************************* CLASE PARA DATOS *************************************/

Datos = function(){};
$.extend( Datos.prototype, {
	
	url: 'http://77digital.digimoblabs.com/webservice.php',
	datos: [],
	reservas: [],
	lastUpdate: '',

	cargandoDatos: '',
	cargandoReservas: '',
	
	paramsDatos: '',
	paramsRervas: '',

	username: '',
	password: '',

	ajaxDatos: '',
	ajaxReservas: '',

	//sincroniza
	Sincronizar: function(){
		this.username = $("#username").val();
		this.password = $("#password").val();

		if( this.Valida() ){
			
			$.mobile.loading( 'show', {
				text: 'Sincronizando',
				textVisible: true,
				theme: 'a',
				html: ""
			});

			this.Datos();
		}
	},

	//obtiene los datos, sincroniza
	Datos: function(){
				
		var paramsDatos = {"username" : this.username, "password" : this.password, "accion" : "vehiculos"};
		
		this.ajaxDatos = $.ajax({
			url: this.url,
			data: paramsDatos,
		    type: 'get',
		    crossDomain: true,
		    async: true,
			contentType: "application/json; charset=utf-8",
	        dataType: "json",
			cache: true,
			beforeSend: function(){
				this.cargandoDatos = true;
			},
			success: function(data){
								
				//actualiza la hora de la ultima sincronizacion
				if( !jQuery.isEmptyObject( data ) ){
					
					window.localStorage.setItem( 'datos', JSON.stringify(data) );

					var date = new Date();
					
					var horas = date.getHours();
					var minutos = date.getMinutes();
					var ampm = horas >= 12 ? 'pm' : 'am';
					horas = horas % 12;
					horas = horas ? horas : 12; 
					minutos = minutos < 10 ? '0'+minutos : minutos;

					this.lastUpdate = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()+" - "+horas+":"+minutos+ampm;
					window.localStorage.setItem( "lastUpdate", this.lastUpdate );

					//CARGA LOS DATOS
					cargar.Cargar();

					notifica.Notificacion('home listo');

				}else{
					notifica.Error('Error al sincronizar, datos recibidos invalidos.');
				}
				this.cargandoDatos = false;
			},
			fail: function(response){
				this.cargandoDatos = false;
				var error = 'La sincronizacion de los datos ha fallado.';
				notifica.Error(error);
			},
			error: function(){
				this.cargandoDatos = false;
				var error = 'Ha ocurrido un error al sincronizar los datos.';
				notifica.Error(error);
			}
		}).done(function(){
			notifica.Notificacion('datos sincronizados');

			this.cargandoDatos = false;
			
			sincronizar.Reservas();
		});
	},

	//calida credenciales
	Valida: function(){
		if( this.username != '' && this.username != null && this.password != '' && this.password != null){

			if( this.username === 'IPURDY' && this.password === 'GPM2013' ){
				return true;
			}else if( this.username === 'IPURDYL' && this.password === 'LEXUS2013' ){
				return true;
			}else if( this.username === 'IPURDYPM' && this.password === 'PMCR2013' ){
				return true;
			}else{
				notifica.Notificacion("Credenciales invalidas.", 'Error');
				return false;
			}

		}else{
			notifica.Notificacion("Por favor increse las credenciales.", 'Error');
			return false;
		}
	},

	//OBTIENE LAS RESERVAS
	Reservas: function(){

		var paramsRervas = {"username" : this.username, "password" : this.password, "accion" : "reservas"};
	
		this.ajaxReservas = $.ajax({
			url: this.url,
			data: paramsRervas,
			type: 'get',
			crossDomain: true,
			async: true,
			contentType: "application/json; charset=utf-8",
	        dataType: "json",
			cache: true,
			beforeSend: function(){
				notifica.Notificacion('peticion reservas');

				cargandoReservas = true;
			},
			success: function(reservas){
				window.localStorage.setItem( 'reservas', JSON.stringify(reservas) );

				this.cargandoReservas = false;
			},
			fail: function(response){
				this.cargandoReservas = false;
				var error = 'La sincronizacion de las reservas ha fallado.';
				notifica.Error(error);
			},
			error: function(){
				this.cargandoReservas = false;
				var error = 'Ha ocurrido un error al sincronizar las reservas.'+
				notifica.Error(error);
			}
		}).done(function(){
			notifica.Notificacion('reservas sincronizadas');

			//termino de cargar las reservas
			this.cargandoReservas = false;

			$.mobile.loading('hide');

			$.mobile.changePage('#home', {role: 'page', transition: 'slideup'});
		});
	},

	ReservasListas: function(){
		if( this.cargandoReservas ){
			return true;
		}else{
			return true;
		}
	},

	DatosListas: function(){
		if( this.cargandoDatos ){
			return true;
		}else{
			return true;
		}
	}
});

/**************************************************************************** CLASE PARA MOSTRAR LOS DETALLES ******************************/

Detalles = function(){};
$.extend( Detalles.prototype, {
	busquedaDatos: '',
	busquedaReservas: '',
	datos: [],
	reservas: [],

	//muesta la info de un registro
	Detalles: function(id){

		//if( window.localStorage.getItem('reservas') != null ){
			
			$.mobile.loading( 'show', {
					text: '',
					textVisible: true,
					theme: 'a',
					html: ""
			});

			this.reservas = JSON.parse( window.localStorage.getItem('reservas') );

			this.busquedaReservas = $.each( this.reservas.INFOUNIDAD, function(f, c){
				if( c.UNIDAD === id ){
					$("#reserva").html('<b class="ui-table-cell-label">Reserva</b>'+c.FECHA_RESERVACION).trigger('create').trigger('create');
					$("#entrega").html('<b class="ui-table-cell-label">Entrega</b>'+c.FECHA_ENTREGA).trigger('create').trigger('create');
					$("#cliente").html('<b class="ui-table-cell-label">Cliente</b>'+c.NOMBRE_CLIENTE).trigger('create').trigger('create');
					$("#vendedor").html('<b class="ui-table-cell-label">Vendedor</b>'+c.NOMBRE_VENDEDOR).trigger('create').trigger('create');
					$("#sucursal").html('<b class="ui-table-cell-label">Sucursal</b>'+c.SUCURSAL).trigger('create').trigger('create');
				}
			});

			this.datos = JSON.parse( window.localStorage.getItem('datos') );

			this.busquedaDatos = $.each( this.datos.INFOUNIDAD, function(f,c){
				if( c.UNIDAD === id ){
					$("#dias-reserva").html('<b class="ui-table-cell-label">Días Reserva</b>'+c.DIAS_RESERVA).trigger('create').trigger('create');

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
			
			$.mobile.changePage('#info', { transition: "slide"} );

			$.mobile.loading( 'hide' );

		/*}else{
			alert('Error: datos de reservas no disponible.');
		}*/
	}
});

/******************************************************************* CLASE PARA NOTIFICACIONES Y ERRORES **********************************/

Notificaciones = function(){};
$.extend(Notificaciones.prototype, {

	Notificacion: function(text, title, button){
		if(title == null || title == '' || title == undefined ){
			title = 'Notificacion';
		}
		if(button == null || button == '' || button == undefined ){
			button = 'Aceptar';
		}

		navigator.notification.vibrate(2000);
		navigator.notification.beep(2);
		navigator.notification.alert(
		    text,  // message
		    '',         // callback
		    title,            // title
		    button                // buttonName
		);
	},

	//dialogo de confirmacion
	Confirmacion: function(text, title, buttons, callback){
		if(title == null || title == '' || title == undefined ){
			title = 'Confirmacion';
		}

		navigator.notification.vibrate(2000);
		navigator.notification.beep(2);
		navigator.notification.confirm(
		    text,  // message
		    callback,         // callback
		    title,            // title
		    buttons   // buttonName
		);
	},

	//notifica error
	Error: function(text, title, button){
		if(title == null || title == '' || title == undefined ){
			title = 'Error';
		}
		if(button == null || button == '' || button == undefined ){
			button = 'Aceptar';
		}

		navigator.notification.vibrate(4000);
		navigator.notification.beep(4);
		navigator.notification.alert(
		    text,  // message
		    '',         // callback
		    title,            // title
		    button                // buttonName
		);
	}
});

//clases en cache, mejora el rendimiento
var cargar = new Cargar();
var filtro = new Filtro();
var sincronizar = new Datos();
var detalles = new Detalles();

var notifica = new Notificaciones();

/************************************************************************************* PHONEGAP ********************************************/

//espera que cordova cargue
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	
	//CARGA DATA LOCAL
	cargar.Cargar();

	//inicializa los filtros
	filtro.init();

	navigator.splashscreen.hide();
}

/************************** JQUERY *********************/

$(document).delegate('#sincronizar', 'pageshow', function () {
    /*$('#sincronizarHeader .ui-btn').bind('tap', function(){
		CancelarDialogo();
	});*/
	$('#sincronizarHeader .ui-btn').remove();
});

$(document).bind('mobileinit',function(){
	$.mobile.allowCrossDomainPages = true;
	$.mobile.selectmenu.prototype.options.nativeMenu = true;
	
	//$.mobile.fixedToolbars.hide(true);
	
	$.mobile.touchOverflowEnabled = true;
	$.mobile.transitionFallbacks = 'none';

	//fast buttons
	$.mobile.buttonMarkup.hoverDelay = 500;

	$.mobile.phonegapNavigationEnabled = true;

	$.mobile.page.prototype.options.domCache = true;
	$.mobile.useFastClick  = false;

	$.mobile.dialog.prototype.options.hideCloseBtn = true;
});


$(document).ready(function(){
	onDeviceReady();
});

//consulta
function Consultar(){
	cargar.Comfirmar();
}

//sincroniza
function Sincronizar(){
	sincronizar.Sincronizar();
}

//cierra el dialogo
function CancelarDialogo(){
	//$('.ui-dialog').dialog('close');
	$.mobile.changePage('#home', {role: 'page', transition: 'slideup'});
}

/************************* HELPES *******************/

/**
* MUESTRA UN MENSAJE DE ERROR GENERICO
*/
function Error(error, title){
	notifica.Error(error, title);
}