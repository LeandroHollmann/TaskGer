// const apiUrl = 'https://67106488a85f4164ef2dd39c.mockapi.io/Tasks';

document.addEventListener('DOMContentLoaded', () => {
const listaTareas = document.getElementById('listaTareas');
const guardarCambiosBtn = document.getElementById('guardarCambios');
const cancelarCambiosBtn = document.getElementById('cancelarCambios');
const accionSelect = document.getElementById('accionSelect');
const formularioTarea = document.getElementById('formularioTarea');
const tareaForm = document.getElementById('tareaForm');
const tareasExistentes = document.getElementById('tareasExistentes');

let tareasOriginales = [];
let tareasModificadas = [];

// Cargador de tareas
async function cargarTareas() {
    try {
        const response = await fetch(apiUrl);
        const tareas = await response.json();

        tareasOriginales = [...tareas]; // Guardar una copia para modificar
        mostrarTareas(tareas);

        actualizarTextoTareasExistentes(tareas.length); // Actualizar el texto del número de tareas existentes
    } catch (error) {
        console.error('Error al cargar tareas:', error);
    }
}

// Actualizar el texto dinámico del número de tareas
function actualizarTextoTareasExistentes(cantidad) {
    tareasExistentes.textContent = `Tareas existentes (${cantidad})`;
}

// Mostrar tareas
function mostrarTareas(tareas) {
    listaTareas.innerHTML = '';
    tareas.forEach((tarea) => {
        const tareaCard = document.createElement('div');
        tareaCard.className = 'card mb-3';

        tareaCard.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title">${tarea.titulo}</h5>
                    <p class="card-text text-muted">${tarea.descripcion}</p>
                    ${tarea.estado === 'finalizado' ? '<span class="badge bg-success">Completada</span>' : ''}
                </div>
                <div>
                    <button class="btn btn-info editar-btn me-2" data-id="${tarea.id}">Editar</button>
                    <button class="btn btn-danger eliminar-btn" data-id="${tarea.id}">Eliminar</button>
                </div>
            </div>
        `;

        listaTareas.appendChild(tareaCard);
    });
}

// Mostrar el formulario según la acción seleccionada
accionSelect.addEventListener('change', (e) => {
    if (e.target.value === 'crear') {
        tareaForm.reset();
        document.getElementById('tareaId').value = ''; // Limpiar el campo oculto de ID
        guardarCambiosBtn.textContent = 'Guardar nueva tarea';
    } else {
        guardarCambiosBtn.textContent = 'Guardar cambios';
    }
    formularioTarea.style.display = 'block';
});

// Manejar la edición de una tarea
listaTareas.addEventListener('click', (e) => {
    if (e.target.classList.contains('editar-btn')) {
        const tareaId = e.target.getAttribute('data-id');
        const tarea = tareasOriginales.find(t => t.id === tareaId);

        if (tarea) {
            // Rellenar el formulario con los datos de la tarea seleccionada
            document.getElementById('tareaId').value = tarea.id;
            document.getElementById('titulo').value = tarea.titulo;
            document.getElementById('descripcion').value = tarea.descripcion;
            document.getElementById('estado').value = tarea.estado;

            // Cambiar la acción a "modificar"
            accionSelect.value = 'modificar';
            guardarCambiosBtn.textContent = 'Guardar cambios';
        }
    }
});

// Manejador del botón eliminar
listaTareas.addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminar-btn')) {
        const tareaId = e.target.getAttribute('data-id');
        
        // Confirmación antes de eliminar
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmacion.isConfirmed) {
            try {
                await fetch(`${apiUrl}/${tareaId}`, {
                    method: 'DELETE',
                });

                // Eliminar la tarea de la lista local y actualizar el DOM
                tareasOriginales = tareasOriginales.filter(t => t.id !== tareaId);
                mostrarTareas(tareasOriginales);
                actualizarTextoTareasExistentes(tareasOriginales.length);

                Swal.fire('Tarea eliminada', '', 'success');
            } catch (error) {
                Swal.fire('Error al eliminar la tarea', error.message, 'error');
            }
        }
    }
});

// Guardar cambios o crear nueva tarea
tareaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tareaId = document.getElementById('tareaId').value;
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const estado = document.getElementById('estado').value;

    if (accionSelect.value === 'crear' || !tareaId) {
        // intenta crear una nueva tarea
        try {
            await crearTarea(titulo, descripcion, estado);
            Swal.fire('Tarea creada con éxito', '', 'success');
        } catch (error) {
            Swal.fire('Error al crear la tarea', error.message, 'error');
        }
    } else {
        // o tambien modifica una
        try {
            await modificarTarea(tareaId, titulo, descripcion, estado);
            Swal.fire('Cambios guardados', '', 'success');
        } catch (error) {
            Swal.fire('Error al guardar los cambios', error.message, 'error');
        }
    }

    // Recargar las tareas después de guardar o actualizar
    await cargarTareas();
    tareaForm.reset(); // Limpiar el form
    accionSelect.value = 'crear'; // Volver a la acción de crear
    guardarCambiosBtn.textContent = 'Guardar nueva tarea';
});


// Inicializar la página
cargarTareas();})
