//============================ DOM VARIABLES ==================== 
const logo = document.querySelector('.logo-pixabay');

const btnSearch = document.querySelector('#btn-mobile-search');
const btnClose = document.querySelector('#btn-mobile-close');

const header = document.querySelector('#header');
const iconoHeader = document.querySelector('#icono-header');
const formularioHeader = document.querySelector('#formulario-header');
const contenedorInput = document.querySelector('#contenedor-input-header');
const inputHeader = document.querySelector('#input-header');

const formulario = document.querySelector('#formulario');
const iconoMain = document.querySelector('#icono-main');
const inputMain = document.querySelector('#input-main');

const infoResultado = document.querySelector('#info-resultado');
const numeroPagina = document.querySelector('#numero-pagina');
const resultadoDiv = document.querySelector('#resultado');
const paginacionDiv = document.querySelector('#paginacion');

//============================ VARIABLES GLOBALES ==================== 
const registrosPorPagina = 40; //imagenes por pagina

let busqueda = '';
let totalPaginas;
let iterador;
let paginaActual = 1; //por defecto siempre es 1

//============================ EVENTOS DEL DOM ==================== 

//evento para el header al hacer scroll
window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
        header.classList.remove("sm:bg-transparent");

        header.classList.add("shadow-md");

        formularioHeader.classList.remove('hidden');

        logo.classList.remove('filter-invert');
    } else {
        header.classList.add("sm:bg-transparent");

        header.classList.remove("shadow-md");

        formularioHeader.classList.add('hidden');

        logo.classList.add('filter-invert');
    }
});

//evento para el input del header
//al entrar al input agrega la clase para el boxshadow
inputHeader.addEventListener('click', () => {
    contenedorInput.classList.add('focus');
    iconoHeader.classList.replace('text-gray-500', 'text-green-500');
    inputHeader.classList.add('focus-input');
});

inputMain.addEventListener('click', () => {
    iconoMain.classList.replace('text-gray-500', 'text-green-500');
});

//al salir del input quita la clase para el boxshadow
inputHeader.addEventListener('blur', () => {
    contenedorInput.classList.remove('focus');
    iconoHeader.classList.replace('text-green-500', 'text-gray-500');
    inputHeader.classList.remove('focus-input');
});

inputMain.addEventListener('blur', () => {
    iconoMain.classList.replace('text-green-500', 'text-gray-500');
});

//eventos botones para abrir o cerrar el input en el responsive
btnSearch.addEventListener('click', () => {
    formularioHeader.style.top = '20%';
});

btnClose.addEventListener('click', () => {
    formularioHeader.style.top = '-40px';
});

//eventos para los inputs para obtener las imagenes
window.onload = () => {
    formularioHeader.addEventListener('submit', validarFormulario);
    formulario.addEventListener('submit', validarFormulario);
};

//============================ FUNCIONES ==================== 
function validarFormulario(e) {
    e.preventDefault();

    paginaActual = 1;

    const id = e.target[1].id; //id del input

    busqueda = document.querySelector('#' + id).value;

    buscarImagenes(id);

    //resetear lo que esta escrito en el formulario
    document.querySelector('#' + id).value = '';
};

//ASYNC AWAIT CON API
async function buscarImagenes() {
    const key = '31346272-ce2caa7e4bb876b68b29e6d55';
    const url = `https://pixabay.com/api/?key=${key}&q=${busqueda}&per_page=${registrosPorPagina}&page=${paginaActual}`;

    try {
        const respuesta = await fetch(url);
        const resultado = await respuesta.json();

        //mostrar u ocultar contenedores de las imagenes y paginacion
        if(resultado.totalHits === 0){
            resultadoDiv.classList.add('hidden');
            paginacionDiv.classList.add('hidden');

            infoResultado.textContent = `No hay imagenes relacionadas con "${busqueda}"`;
        } else {
            resultadoDiv.classList.remove('hidden');
            paginacionDiv.classList.remove('hidden');

            infoResultado.textContent = `${resultado.totalHits} imagenes relacionadas con "${busqueda}"`;
        }

        //calcular el numero de paginas, para crear  los botones de la paginacion de forma dinamica
        totalPaginas = calcularPaginas(resultado.totalHits);

        if(resultado.totalHits > 0) {
            numeroPagina.textContent = `Página ${paginaActual}/${totalPaginas}`;
        } else {
            numeroPagina.textContent = '';
        }
        
        mostrarImagenes(resultado.hits);
    } catch (error) {
        console.log(error)
    }
};

//generador, funcion que retorna un iterador
function* crearPaginador(total) {
    for (let i = 1; i <= total; i++) {
        yield i;
    }
};

function calcularPaginas(total) {
    return parseInt(Math.ceil(total / registrosPorPagina));
};

function mostrarImagenes(imagenes) {
    //remueve html previo al realizar nueva busqueda o cambiar de pagina
    while (resultadoDiv.firstChild) {
        resultadoDiv.removeChild(resultadoDiv.firstChild);
    }

    imagenes.forEach(imagen => {
        //informacion de la api
        const { previewURL, likes, views, largeImageURL } = imagen;

        resultadoDiv.innerHTML += `
            <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
                <div class="bg-white shadow-2xl">
                    <div class='w-full sm:h-40 overflow-hidden'>
                        <img class="w-full" src="${previewURL}" >
                    </div>

                    <div class="p-4">
                        <p class="font-bold text-xs sm:text-base"> ${likes} <span class="font-normal"> Me Gusta </span> </p>
                        <p class="font-bold text-xs sm:text-base"> ${views} <span class="font-normal"> Veces Vista </span> </p>

                        <a 
                            class="text-xs sm:text-base block w-full text-green-500 uppercase font-bold text-center mt-5 p-1 hover:text-green-400"
                            href="${largeImageURL}" target="_blank" rel="noopener noreferrer" 
                        >
                            Ver Imagen
                        </a>
                    </div>
                </div>
            </div>
        `;
    });

    // Limpiar el paginador previo (botones de la paginacion)
    while (paginacionDiv.firstChild) {
        paginacionDiv.removeChild(paginacionDiv.firstChild)
    }

    // Generamos el nuevo HTML del paginador
    imprimirPaginador();
};

function imprimirPaginador() {
    //funcion que retorna un iterador
    iterador = crearPaginador(totalPaginas);

    //aqui es donde realmente se tiene que iterar uno por uno manualmente
    while (true) {
        const { value, done } = iterador.next();

        if (done) return; //cuando sea true, significa que acabo la iteracion

        // Caso contrario, genera un botón por cada elemento en el generador
        const boton = document.createElement('a');
        boton.href = '#main';
        boton.dataset.pagina = value;
        boton.textContent = value;

        //resaltar el boton que indique el numero de pagina en el que estamos
        if(paginaActual === value){
            boton.classList.add('siguiente', 'bg-green-500', 'text-white', 'border-2', 'border-transparent', 'h-10', 'w-10', 'mr-2', 'font-bold', 'mb-4', 'rounded-full');
        } else {
            boton.classList.add('siguiente', 'text-black', 'border-2', 'border-black', 'h-10', 'w-10', 'mr-2', 'font-bold', 'mb-4', 'rounded-full', 'hover:bg-green-500', 'hover:text-white', 'transition-bg', 'duration-300');
        }

        //evento para mostrar imagenes segun la pagina en la que estemos
        boton.onclick = () => {
            paginaActual = value;

            buscarImagenes();
        }

        paginacionDiv.appendChild(boton);
    }
};

//para el footer, mostrar el año actual
function getYear() {
    document.querySelector('.year').textContent = new Date().getFullYear();
};

getYear();