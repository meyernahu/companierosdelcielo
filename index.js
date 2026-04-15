document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-generate');
    const display = document.getElementById('saint-display');

    btn.addEventListener('click', async () => {
        try {
            // Fetch del archivo JSON local
            const response = await fetch('santos.json');
            const santos = await response.json();

            // Selección aleatoria
            const randomSaint = santos[Math.floor(Math.random() * santos.length)];

            // Actualización del DOM
            document.getElementById('saint-name').innerText = randomSaint.nombre;
            document.getElementById('saint-patronage').innerText = randomSaint.patronazgo;
            document.getElementById('saint-feast').innerText = randomSaint.festividad;
            document.getElementById('saint-quote').innerText = `"${randomSaint.frase}"`;
            
            const img = document.getElementById('saint-photo');
            img.src = randomSaint.foto;
            img.alt = randomSaint.nombre;

            display.classList.remove('hidden');
        } catch (error) {
            console.error("Error cargando los santos:", error);
            alert("No se pudo cargar el santoral. Intenta de nuevo.");
        }
    });
});
