document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-generate');
    const display = document.getElementById('saint-display');
    const img = document.getElementById('saint-photo');
    
    // Elementos de texto
    const nameEl = document.getElementById('saint-name');
    const patronageEl = document.getElementById('saint-patronage');
    const feastEl = document.getElementById('saint-feast');
    const quoteEl = document.getElementById('saint-quote');

    // Variable global para almacenar los datos del JSON en memoria (Caché)
    let santosCache = null;

    // Función para consultar la API pública de Wikipedia
    async function getWikipediaImage(saintName) {
        try {
            // Buscamos la página en Wikipedia por el nombre y pedimos la miniatura (max 500px)
            const apiUrl = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(saintName)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Error en la respuesta de Wikipedia");
            
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0]; 
            
            // Si el artículo existe y tiene una imagen asignada, devolvemos la URL
            if (pageId !== "-1" && pages[pageId].thumbnail) {
                return pages[pageId].thumbnail.source;
            }
            return null; // No tiene foto principal
        } catch (error) {
            console.error(`Error obteniendo imagen de Wikipedia para ${saintName}:`, error);
            return null;
        }
    }

    // Lógica al hacer clic en el botón
    async function handleGenerateClick() {
        // 1. Prevenir múltiples clics bloqueando el botón
        btn.disabled = true;
        const originalBtnText = btn.innerText;
        btn.innerText = "Buscando intercesor...";

        try {
            // 2. Cargar el JSON solo si aún no está en caché
            if (!santosCache) {
                const response = await fetch('santos_v0.0.1.json'); // Usamos el nombre exacto de tu archivo
                if (!response.ok) throw new Error("No se pudo cargar el archivo JSON local");
                santosCache = await response.json();
            }

            // 3. Seleccionar un santo al azar
            const randomSaint = santosCache[Math.floor(Math.random() * santosCache.length)];

            // 4. Actualizar los textos en el DOM
            nameEl.innerText = randomSaint.nombre;
            patronageEl.innerText = randomSaint.patronazgo;
            feastEl.innerText = randomSaint.festividad;
            quoteEl.innerText = `"${randomSaint.frase}"`;
            
            // 5. Preparar la vista de la imagen con un SVG de carga (placeholder)
            display.classList.remove('hidden');
            img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22500%22%20viewBox%3D%220%200%20500%20500%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22500%22%20height%3D%22500%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%3E%20Cargando%20imagen...%3C%2Ftext%3E%3C%2Fsvg%3E'; 
            img.alt = `Cargando imagen de ${randomSaint.nombre}`;
            
            // 6. Pedir la foto a Wikipedia
            const wikiImageUrl = await getWikipediaImage(randomSaint.nombre);

            // 7. Mostrar la foto real o un SVG de "Sin imagen" si Wikipedia no tiene nada
            if (wikiImageUrl) {
                img.src = wikiImageUrl;
            } else {
                img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22500%22%20viewBox%3D%220%200%20500%20500%22%3E%3Crect%20fill%3D%22%23f8fafc%22%20width%3D%22500%22%20height%3D%22500%22%2F%3E%3Ctext%20fill%3D%22%2394a3b8%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%3EImagen%20no%20disponible%3C%2Ftext%3E%3C%2Fsvg%3E';
            }
            img.alt = randomSaint.nombre;

        } catch (error) {
            console.error("Error en el proceso:", error);
            alert("Hubo un problema al cargar el santoral. Por favor, verifica tu conexión.");
        } finally {
            // 8. Restaurar el botón para permitir nuevas búsquedas
            btn.disabled = false;
            btn.innerText = originalBtnText;
        }
    }

    // Asignar el evento al botón
    btn.addEventListener('click', handleGenerateClick);
});
