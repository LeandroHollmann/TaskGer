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

    async function cargarTareas() {
        try {
            const response = await fetch(apiUrl);
            const tareas = await response.json();
            tareasOriginales = [...tareas];
            mostrarTareas(tareas);

            if (tareasExistentes) {
                tareasExistentes.textContent = `Tareas existentes (${tareas.length})`;
            }
        } catch (error) {
            console.error('Error al cargar tareas:', error);
        }
    }

    function mostrarTareas(tareas) {
        if (!listaTareas) return;
        listaTareas.innerHTML = '';

        tareas.forEach(tarea => {
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

    listaTareas?.addEventListener('click', (e) => {
        if (e.target.classList.contains('editar-btn')) {
            const tareaId = e.target.getAttribute('data-id');
            const tarea = tareasOriginales.find(t => t.id === tareaId);

            if (tarea) {
                document.getElementById('tareaId').value = tarea.id;
                document.getElementById('titulo').value = tarea.titulo;
                document.getElementById('descripcion').value = tarea.descripcion;
                document.getElementById('estado').value = tarea.estado;

                if (accionSelect) accionSelect.value = 'modificar';
                if (guardarCambiosBtn) guardarCambiosBtn.textContent = 'Guardar cambios';
            }
        }
        // manejador del boton eliminar
        if (e.target.classList.contains('eliminar-btn')) {
            const tareaId = e.target.getAttribute('data-id');

            Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await fetch(`${apiUrl}/${tareaId}`, {
                            method: 'DELETE',
                        });

                        // Eliminar la tarea de la lista local y actualizar el DOM
                        tareasOriginales = tareasOriginales.filter(t => t.id !== tareaId);
                        mostrarTareas(tareasOriginales);
                        if (tareasExistentes)
                            tareasExistentes.textContent = `Tareas existentes (${tareasOriginales.length})`;

                        Swal.fire('Tarea eliminada', '', 'success');
                    } catch (error) {
                        Swal.fire('Error al eliminar la tarea', error.message, 'error');
                    }
                }
            });
        }
    });

    // Guardar cambios o crear nueva tarea (unico form handler)
    tareaForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tareaId = document.getElementById('tareaId')?.value;
        const titulo = document.getElementById('titulo')?.value;
        const descripcion = document.getElementById('descripcion')?.value;
        const estado = document.getElementById('estado')?.value;

        if (!titulo || !descripcion || !estado) {
            Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }

        try { // intenta crear tarea
            if (accionSelect?.value === 'crear' || !tareaId) {
                await crearTarea(titulo, descripcion, estado);
                Swal.fire('Tarea creada con éxito', '', 'success');
            } else { // o modificarla
                await modificarTarea(tareaId, titulo, descripcion, estado);
                Swal.fire('Cambios guardados', '', 'success');
            }

            await cargarTareas();
            tareaForm.reset();
            if (accionSelect) accionSelect.value = 'crear';
            if (guardarCambiosBtn) guardarCambiosBtn.textContent = 'Guardar nueva tarea';

        } catch (error) { // si hay error creando o modificando
            Swal.fire('Error', error.message, 'error');
        }
    });

    cargarTareas();
});