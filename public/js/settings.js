document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos
    const idiomaSelect = document.getElementById('idiomaSelect');
    const velocidadSlider = document.getElementById('velocidadSlider');
    const velocidadValor = document.getElementById('velocidadValor');
    const configForm = document.getElementById('configForm');

    // Verificar que los elementos existan antes de trabajar con ellos
    if (!idiomaSelect || !velocidadSlider || !velocidadValor || !configForm) {
        console.error("Uno o más elementos no existen en el DOM.");
        return;
    }
    
    // Idiomas disponibles (predefinidos o desde una API)
    const idiomas = [
        { value: 'es-AR', label: 'Español (Argentina)' },
        { value: 'es-ES', label: 'Español (España)' },
        { value: 'en-US', label: 'Inglés (Estados Unidos)' },
        // Agregar más idiomas según sea necesario
    ];

    // Rellenar el combo de idiomas
    idiomas.forEach(idioma => {
        const option = document.createElement('option');
        option.value = idioma.value;
        option.textContent = idioma.label;
        idiomaSelect.appendChild(option);
    });

    // Configuración de velocidad
    velocidadSlider.addEventListener('input', () => {
        velocidadValor.textContent = velocidadSlider.value;
    });

    // Cargar configuración almacenada
    const idiomaGuardado = localStorage.getItem('idioma');
    const velocidadGuardada = localStorage.getItem('velocidad');
    
    if (idiomaGuardado) {
        idiomaSelect.value = idiomaGuardado;
    }

    if (velocidadGuardada) {
        velocidadSlider.value = velocidadGuardada;
        velocidadValor.textContent = velocidadGuardada;
    }

    // Guardar configuración cuando el formulario se envíe
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idioma = idiomaSelect.value;
        const velocidad = velocidadSlider.value;

        // Guardar en localStorage
        localStorage.setItem('idioma', idioma);
        localStorage.setItem('velocidad', velocidad);

        // Aplicar el cambio de idioma y velocidad al speechSynthesis
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance("Configuración guardada!");
        utterance.lang = idioma; // Cambiar idioma
        utterance.rate = parseFloat(velocidad); // Cambiar velocidad
        synth.speak(utterance);

        alert('Configuración guardada!');
    });
});