window.addEventListener('load', obtenerDatos);

function obtenerDatos() {

    const Nasa_key = '7EOejC8X6wsEQnSRyc8Tk8z3y0cwXypBjuUw5dJH';
    const ruta = `https://api.nasa.gov/planetary/apod?api_key=${Nasa_key}`;

    fetch(ruta)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarDatos(resultado));
}

function mostrarDatos({ date, explanation, media_type, title, url }) {

    const titulo = document.querySelector('#titulo');
    titulo.innerHTML = title;

    const fecha = document.querySelector('#fecha');
    fecha.innerHTML = date;

    const descripcion = document.querySelector('#descripcion');
    descripcion.innerHTML = explanation;

    const multimedia = document.querySelector('#c_multimedia');

    if (media_type == 'video') {
        multimedia.innerHTML = `
            <iframe class="embed-responsive-item" src="${url}"></iframe>
        `;
    } else {
        multimedia.innerHTML = `
            <img src="${url}" class="img-fluid" alt="${url}">
        `;
    }
}

function mostrarDatos({ date, explanation, media_type, title, url, hdurl }) {
  // Título
  document.getElementById('titulo').textContent = title;

  // Fecha formateada
  const fechaFormateada = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('fecha').textContent = fechaFormateada;

  // Descripción
  document.getElementById('descripcion').textContent = explanation;

  // Multimedia
  const hero = document.getElementById('hero');
  if (media_type === 'video') {
    // Asegurarse de que la URL del iframe tenga autoplay desactivado
    const src = url.includes('?') ? url + '&autoplay=0' : url + '?autoplay=0';
    hero.innerHTML = `<iframe src="${src}" allowfullscreen title="${title}"></iframe>`;
  } else {
    // Preferir la versión HD si está disponible
    const imgSrc = hdurl || url;
    const img = new Image();
    img.src = imgSrc;
    img.alt = title;
    img.onload = () => {
      hero.appendChild(img);
      revelar();
    };
    img.onerror = () => {
      // Fallback a URL estándar
      img.src = url;
    };
    return; // revelar() se llama en onload
  }

  revelar();
}

function revelar() {
  // Ocultar loading
  const loading = document.getElementById('loading');
  loading.classList.add('oculto');

  // Mostrar hero y panel con animación
  setTimeout(() => {
    document.getElementById('hero').classList.add('visible');
    document.getElementById('panel').classList.add('visible');
  }, 100);
}

function mostrarError() {
  document.getElementById('loading').classList.add('oculto');
  document.getElementById('error').classList.add('visible');
}