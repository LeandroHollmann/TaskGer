const apiUrl = 'https://67106488a85f4164ef2dd39c.mockapi.io/Tasks';

// Obtener elementos (algunos pueden no existir en ciertas páginas)
const startBtn = document.getElementById('startBtn');
const bienvenida = document.getElementById('bienvenida');
const elementosOcultos = document.querySelectorAll('.hidden');
const footer = document.querySelector('footer');

// Verificar si la bienvenida existe antes de usarla
if (bienvenida) {
    // Verificar si la bienvenida ya fue vista
    const bienvenidaVista = localStorage.getItem("bienvenidaVista");

    if (bienvenidaVista === "true") {
        // Ocultar la pantalla de bienvenida y mostrar el contenido
        bienvenida.style.display = "none";
        elementosOcultos.forEach(el => el.classList.remove("hidden"));
        if (footer) footer.style.display = "block"; // Verificar si el footer existe antes de modificarlo
    } else {
        // Mostrar la pantalla de bienvenida y ocultar el contenido
        bienvenida.style.display = "flex";
        elementosOcultos.forEach(el => el.classList.add("hidden"));
        if (footer) footer.style.display = "none";
    }

    // Evento para ocultar la bienvenida y mostrar el contenido
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            bienvenida.classList.add("fade-out");
            setTimeout(() => {
                bienvenida.style.display = "none";
                elementosOcultos.forEach(el => el.classList.remove("hidden"));
                if (footer) footer.style.display = "block";
                localStorage.setItem("bienvenidaVista", "true");
            }, 500);
        });
    }
}

///////////////////////////////////////
// Helper: Formatear fecha y hora
///////////////////////////////////////
function formatearFecha(fechaISO) {
    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Formato 24 horas
        timeZone: 'America/Argentina/Buenos_Aires', // Zona horaria argentina
    };

    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', opciones);
}

///////////////////////////////////////
// GET === Obtener todas las tareas
///////////////////////////////////////
async function obtenerTareas() {
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const tareas = await response.json();
            console.log('Tareas obtenidas:', tareas);
            return tareas;
        } else {
            throw new Error('Error al obtener las tareas');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

///////////////////////////////////////
// POST === Crear una nueva tarea
///////////////////////////////////////
async function crearTarea(titulo, descripcion, estado = 'pendiente') {
    // Obtener todas las tareas existentes
    const tareas = await obtenerTareas();
    if (!tareas) return; // Si no hay tareas, no continuamos
    
    // Comprobar si ya existe una tarea con el mismo título (ignorando mayúsculas/minúsculas)
    const tareaExistente = tareas.some(tarea => tarea.titulo.toLowerCase() === titulo.toLowerCase());
    
    if (tareaExistente) {
        // Si ya existe una tarea con el mismo nombre, mostrar una alerta
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Ya existe una tarea con ese nombre. Por favor, elige otro título.',
            confirmButtonText: 'Aceptar'
        });
        return; // Salir de la función sin crear la tarea
    }

    // Si no existe una tarea con ese nombre, crear la nueva tarea
    const nuevaTarea = {
        titulo,
        descripcion,
        estado,
        fechacreacion: new Date().toISOString(), // Fecha actual en formato ISO
        fechaconclusion: null, // Inicialmente null
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea),
        });

        if (response.ok) {
            const tareaCreada = await response.json();
            console.log('Tarea creada:', tareaCreada);
            return tareaCreada;
        } else {
            throw new Error('Error al crear la tarea');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

///////////////////////////////////////
// PUT === Modificar una tarea
///////////////////////////////////////
async function modificarTarea(id, titulo, descripcion, estado) {
    const tareaModificada = {
        titulo,
        descripcion,
        estado,
        fechaconclusion: estado === 'finalizado' ? new Date().toISOString() : null, // Actualizar si se finaliza
    };

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tareaModificada),
        });

        if (response.ok) {
            const tareaActualizada = await response.json();
            console.log('Tarea actualizada:', tareaActualizada);
            return tareaActualizada;
        } else {
            throw new Error('Error al modificar la tarea');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

///////////////////////////////////////
// Renderizar tareas en index.html
///////////////////////////////////////

async function renderizarTareas() {
    const contenedor = document.getElementById('tareasContainer');
    if (!contenedor) {
        console.warn('No se encontró el contenedor de tareas. Deteniendo renderización.');
        return; // Evita errores si el contenedor no existe
    }

    const tareas = await obtenerTareas();
    if (!tareas) return;

    console.log('Tareas obtenidas:', tareas);

    const tareasPendientes = tareas.filter(t => t.estado !== 'finalizado');
    const tareasFinalizadas = tareas.filter(t => t.estado === 'finalizado');

    contenedor.innerHTML = '';

    [...tareasPendientes, ...tareasFinalizadas].forEach(tarea => {
        const tareaCard = document.createElement('div');
        tareaCard.classList.add('card', 'mb-3', 'col-md-4');
        if (tarea.estado === 'finalizado') tareaCard.classList.add('text-muted');

        tareaCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${tarea.titulo}</h5>
                <p class="card-text">Creada: ${formatearFecha(tarea.fechacreacion)}</p>
                ${
                    tarea.fechaconclusion
                        ? `<p class="card-text">Concluida: ${formatearFecha(tarea.fechaconclusion)}</p>`
                        : ''
                }
                <button class="btn btn-primary play-btn" data-id="${tarea.id}">▶️ Reproducir</button>
            </div>
        `;

        contenedor.appendChild(tareaCard);
    });

    // Asociar eventos de reproducción de audio
    document.querySelectorAll('.play-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const tareaId = e.target.getAttribute('data-id');
            const tarea = tareas.find(t => t.id === tareaId);
            if (tarea) reproducirAudioTarea(tarea);
        });
    });
}

// Cargar las tareas al iniciar (solo si el contenedor existe)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tareasContainer')) {
        renderizarTareas();
    }
});

    // Asociar eventos de reproducción de audio
    document.querySelectorAll('.play-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const tareaId = e.target.getAttribute('data-id');
            const tarea = tareas.find(t => t.id === tareaId);
            if (tarea) reproducirAudioTarea(tarea);
        });
    });


// Función para reproducir tarea usando SpeechSynthesis
function reproducirAudioTarea(tarea) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(`${tarea.titulo}. ${tarea.descripcion}`);
    
    // Leer la configuración de idioma y velocidad desde localStorage
    const idioma = localStorage.getItem('idioma') || 'es-AR'; // Valor por defecto: Español (Argentina)
    const velocidad = parseFloat(localStorage.getItem('velocidad')) || 1; // Valor por defecto: 1

    utterance.lang = idioma; // Aplicar idioma
    utterance.rate = velocidad; // Aplicar velocidad
    
    synth.speak(utterance);
}

// Cargar las tareas al iniciar
document.addEventListener('DOMContentLoaded', renderizarTareas);

