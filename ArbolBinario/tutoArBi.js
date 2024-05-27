document.addEventListener('DOMContentLoaded', function() {
    const pasos = [
        {
            elemento: document.getElementById('navMenu'),
            mensaje: 'Aquí puedes navegar a diferentes secciones de nuestro sitio.',
        },
        {
            elemento: document.getElementById('arbol-container'),
            mensaje: 'Este es el área central de interacción donde puedes ver y editar los grafos.',
            posicionMedio: true,
        },
        {
            elemento: document.getElementById('opciones-container'),
            mensaje: 'Aquí puedes seleccionar la opcion que desees realizar con los arboles.',
            posicionMedio: true,

        },
        {
            elemento: document.getElementById('agregarNumBtn'),
            mensaje: 'Con este boton puedes agregar un nodo con su valor, uno por uno.',
        },
        {
            elemento: document.getElementById('listaRandomBtn'),
            mensaje: 'Con este boton puedes generar numeros random en cantidad y de forma rápida.',
        },
        {
            elemento: document.getElementById('ordenarPreBtn'),
            mensaje: 'Con este boton se aplicara el PRE ORDER en el arbol.',
        },
        {
            elemento: document.getElementById('ordenarInBtn'),
            mensaje: 'Con este boton se aplicara el IN ORDER en el arbol.',
        },
        {
            elemento: document.getElementById('ordenarPostBtn'),
            mensaje: 'Con este boton se aplicara el POST ORDER en el arbol.',
        },
        {
            elemento: document.getElementById('exportBtn'),
            mensaje: 'Guarda el estado actual de tu arbol aquí.',
        },
        {
            elemento: document.getElementById('importBtn'),
            mensaje: 'Carga un arbol previamente guardado.',
        },
        {
            elemento: document.getElementById('limpiarBtn'),
            mensaje: 'Limpia el lienzo y empieza de nuevo.',
        },
        {
            elemento: document.getElementById('PostInOrderBtn'),
            mensaje: 'Con este boton puedes combinar el POST e IN en el orden  .',
        },
        {
            elemento: document.getElementById('resultado-container'),
            mensaje: 'En este contenedor aparecera el resultado del arbol con el orden seleccionado',
        },
        {
            elemento: document.getElementById('contenedor-general'),
            mensaje: '¡OJO! Recuerda que para seleccionar otro tipo de orden o acción, debes esperar a que la animacion del arbol termine el ordenamiento de los valores.',
            posicionMedio: true,

        }

    ];
    let pasoActual = 0;

    function mostrarPaso(paso) {
        ocultarPasos();
        removerDesenfoque();
        aplicarDesenfoque();
        paso.elemento.style.position = 'relative'; // Importante para que z-index funcione
        paso.elemento.style.zIndex = '1006'; // Asegúrate de que esté por encima de la capa de desenfoque

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        // Agrega tu HTML de tooltip aquí
        tooltip.style.zIndex = '1006';
        tooltip.innerHTML = `<p>${paso.mensaje}</p><div style="margin-top: 10px;">`;

        if (pasoActual > 0) {
            tooltip.innerHTML += `<button onclick="anteriorPaso()" style="margin-right: 5px;"><span style="margin-right: 5px;">←</span></button>`;
        }

        if (pasoActual < pasos.length - 1) {
            tooltip.innerHTML += `<button onclick="siguientePaso()"><span style="margin-left: 5px;">✓</span></button>`;
        } else {
            tooltip.innerHTML += `<button onclick="finalizarTutorial()"><span style="margin-left: 5px;">✓</span></button>`;
        }
        
        tooltip.innerHTML += `</div>`;
        document.body.appendChild(tooltip);

        ajustarZIndex(paso.elemento, tooltip);


        const rect = paso.elemento.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;

        if (paso.posicionMedio) {
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2 - tooltip.offsetHeight / 2}px`;
        }
        
        paso.elemento.classList.add('resaltar');
        aplicarDesenfoque();
    }
    
    
    function ocultarPasos() {
        document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
        document.querySelectorAll('.resaltar').forEach(elemento => elemento.classList.remove('resaltar'));
        removerDesenfoque();
    }
    function ajustarZIndex(elemento, tooltip) {
        elemento.style.position = 'relative';
        elemento.style.zIndex = '1001';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1001';
    }
    function aplicarDesenfoque() {
    // Asegúrate de que la capa de desenfoque esté al fondo de todos los elementos excepto el fondo mismo
    let capaDesenfoque = document.getElementById('capaDesenfoque');
    if (!capaDesenfoque) {
        capaDesenfoque = document.createElement('div');
        capaDesenfoque.id = 'capaDesenfoque';
        document.body.appendChild(capaDesenfoque);
    }
    capaDesenfoque.style.zIndex = "998"; // Asegura que esto sea menor que el tooltip y resaltar pero mayor que el fondo
    capaDesenfoque.style.position = 'fixed';
    capaDesenfoque.style.width = '100vw';
    capaDesenfoque.style.height = '100vh';
    capaDesenfoque.style.top = '0';
    capaDesenfoque.style.left = '0';
    capaDesenfoque.style.background = 'rgba(0,0,0,0.5)';
    capaDesenfoque.style.backdropFilter = 'blur(4px)';
}

    function removerDesenfoque() {
        const capaDesenfoque = document.getElementById('capaDesenfoque');
        if (capaDesenfoque) {
            capaDesenfoque.remove();
        }
    }

    window.anteriorPaso = function() {
        if (pasoActual > 0) {
            pasoActual--;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.siguientePaso = function() {
        if (pasoActual < pasos.length - 1) {
            pasoActual++;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.finalizarTutorial = function() {
        ocultarPasos();
        removerDesenfoque();
        pasoActual = 0;
        alert('Fin del tutorial. Gracias por participar.');
    };

    document.getElementById('helpBtn').addEventListener('click', function() {
        mostrarPaso(pasos[pasoActual]);
    });
});
