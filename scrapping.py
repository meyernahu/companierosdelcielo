import requests
from bs4 import BeautifulSoup
import json
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Accept-Language': 'es-ES,es;q=0.9'
}

def obtener_datos_santo(url_santo):
    """
    Extrae los datos basándose en la estructura de <h1 class="page-title"> 
    y <div class="page-content"> de ACI Prensa.
    """
    try:
        print(f"  -> Procesando: {url_santo}")
        respuesta = requests.get(url_santo, headers=HEADERS, timeout=10)
        
        if respuesta.status_code != 200:
            print(f"  [!] Error de conexión: HTTP {respuesta.status_code}")
            return None

        soup = BeautifulSoup(respuesta.text, 'html.parser')

        # 1. Extraer el Nombre
        nombre_tag = soup.find('h1', class_='page-title')
        nombre = nombre_tag.text.strip() if nombre_tag else "Santo Desconocido"

        # Variables por defecto
        foto = "https://via.placeholder.com/200"
        frase = "Ruega por nosotros."
        
        # 2. Buscar el contenedor principal del artículo
        contenido = soup.find('div', class_='page-content')
        
        if contenido:
            # 2a. Extraer la Foto
            img_tag = contenido.find('img')
            if img_tag and 'src' in img_tag.attrs:
                foto = img_tag['src']
                # Si la URL de la imagen es relativa (ej: /assets/imagen.jpg), la completamos
                if foto.startswith('/'):
                    foto = "https://www.aciprensa.com" + foto
            
            # 2b. Extraer la "Frase" (El primer párrafo con texto)
            parrafos = contenido.find_all('p')
            for p in parrafos:
                texto_parrafo = p.text.strip()
                if texto_parrafo: # Si el párrafo no está vacío
                    frase = texto_parrafo
                    # Si el texto es muy largo, lo cortamos para que se vea bien en tu tarjeta
                    if len(frase) > 150:
                        frase = frase[:147] + "..."
                    break # Detenemos el bucle al encontrar el primer párrafo válido

        return {
            "nombre": nombre,
            "patronazgo": "Definir manualmente", # ACI Prensa no lo etiqueta de forma aislada
            "festividad": "Definir manualmente", # ACI Prensa no lo etiqueta de forma aislada
            "frase": frase,
            "foto": foto
        }

    except Exception as e:
        print(f"  [!] Excepción procesando {url_santo}: {e}")
        return None

def iniciar_scraping():
    print("Iniciando el recolector de santos...")
    
    # Lista de prueba con URLs reales de santos en ACI Prensa
    enlaces_santos = [
        "https://www.aciprensa.com/recurso/4135/san-hugo-de-grenoble",
        "https://www.aciprensa.com/santo/102/santa-liduvina"
    ]

    base_de_datos = []

    for enlace in enlaces_santos:
        datos = obtener_datos_santo(enlace)
        if datos:
            base_de_datos.append(datos)
        
        # Pausa de cortesía para no saturar el servidor
        time.sleep(2) 

    # Guardar en el archivo JSON
    with open('santos.json', 'w', encoding='utf-8') as archivo:
        json.dump(base_de_datos, archivo, ensure_ascii=False, indent=2)
    
    print(f"\n¡Éxito! Se guardaron {len(base_de_datos)} santos en santos.json")

if __name__ == "__main__":
    iniciar_scraping()
