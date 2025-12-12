const API_URL = '/api';

let mueblesData = [];
let variantesData = [];
let carrito = [];

async function fetchAPI(url, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        const responseData = response.status === 204 ? null : await response.json().catch(() => response.text());

        if (!response.ok) {
            const errorMsg = typeof responseData === 'string' ? responseData : (responseData?.message || `Error ${response.status}`);
            throw new Error(errorMsg);
        }

        return responseData;

    } catch (error) {
        throw error;
    }
}

async function fetchMuebles() { return fetchAPI(`${API_URL}/muebles`); }
async function fetchVariantes() { return fetchAPI(`${API_URL}/variantes`); }
async function createMuebleAPI(muebleData) { return fetchAPI(`${API_URL}/muebles`, 'POST', muebleData); }
async function createVarianteAPI(varianteData) { return fetchAPI(`${API_URL}/variantes`, 'POST', varianteData); }
async function enviarCotizacion(cotizacion) { return fetchAPI(`${API_URL}/cotizaciones`, 'POST', cotizacion); }
async function ejecutarConfirmacionVenta(idCotizacion) { return fetchAPI(`${API_URL}/cotizaciones/${idCotizacion}/confirmar`, 'POST'); }
async function fetchCotizacionesPendientes() { return fetchAPI(`${API_URL}/cotizaciones/pendientes`); }
async function fetchCotizacionById(id) { return fetchAPI(`${API_URL}/cotizaciones/${id}`); }

function mostrarMensaje(idElemento, mensaje, color) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.style.color = color;
    }
}

function mostrarVista(vista) {
    const adminView = document.getElementById('admin-view');
    const salesView = document.getElementById('sales-view');

    if (vista === 'admin') {
        adminView.style.display = 'block';
        salesView.style.display = 'none';
        document.getElementById('nav-admin-btn').disabled = true;
        document.getElementById('nav-sales-btn').disabled = false;
    } else if (vista === 'sales') {
        adminView.style.display = 'none';
        salesView.style.display = 'block';
        document.getElementById('nav-admin-btn').disabled = false;
        document.getElementById('nav-sales-btn').disabled = true;
    }
}

function renderizarListaCotizaciones(data) {
    const container = document.getElementById('lista-cotizaciones-container');
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:blue;">No hay cotizaciones pendientes de venta.</p>';
        return;
    }

    let html = '<table style="width:100%; border-collapse: collapse;"><thead><tr>';
    html += `<th>ID Cotización</th><th>Total Estimado</th><th>Fecha Creación</th><th>Ítems</th><th>Acciones</th>`;
    html += '</tr></thead><tbody>';

    data.forEach(cotizacion => {
        const fecha = new Date(cotizacion.fecha_cotizacion).toLocaleDateString('es-CL');
        const total = cotizacion.total.toLocaleString('es-CL');
        const numItems = cotizacion.cotMuebles ? cotizacion.cotMuebles.length : 0;

        html += `
            <tr style="border-bottom: 1px dashed #ccc;">
                <td><strong>${cotizacion.idCotizacion}</strong></td>
                <td>$${total}</td>
                <td>${fecha}</td>
                <td>${numItems}</td>
                <td>
                    <button onclick="mostrarDetalleCotizacion(${cotizacion.idCotizacion})" 
                            style="padding: 5px 10px; background-color: #007bff; color: white; border: none; cursor: pointer;">
                        Ver Detalle
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

async function mostrarDetalleCotizacion(id) {
    const detalleContainer = document.getElementById('detalle-cotizacion-container');
    const itemsContainer = document.getElementById('detalle-cotizacion-items');
    
    detalleContainer.style.display = 'block';
    itemsContainer.innerHTML = 'Cargando detalles...';

    try {
        const cotizacion = await fetchCotizacionById(id);

        document.getElementById('detalle-cotizacion-id').textContent = cotizacion.idCotizacion;
        document.getElementById('detalle-cotizacion-total').textContent = `$${cotizacion.total.toLocaleString('es-CL')}`;
        document.getElementById('detalle-cotizacion-fecha').textContent = new Date(cotizacion.fecha_cotizacion).toLocaleDateString('es-CL');

        let itemsHtml = '<table style="width:100%; border-collapse: collapse; margin-top: 10px;"><thead><tr>';
        itemsHtml += `<th>Mueble</th><th>Variante</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th>`;
        itemsHtml += '</tr></thead><tbody>';

        if (cotizacion.cotMuebles && cotizacion.cotMuebles.length > 0) {
            cotizacion.cotMuebles.forEach(item => {
                const subtotal = item.cantidad * item.precioUnitario;
                
                itemsHtml += `
                    <tr>
                        <td>${item.mueble.nombre_mueble} (ID: ${item.mueble.id_mueble})</td>
                        <td>${item.variante.descripcion} (ID: ${item.variante.idVariante})</td>
                        <td>${item.cantidad}</td>
                        <td>$${item.precioUnitario.toLocaleString('es-CL')}</td>
                        <td>$${subtotal.toLocaleString('es-CL')}</td>
                    </tr>
                `;
            });
        } else {
            itemsHtml += `<tr><td colspan="5" style="text-align: center; color: red;">No hay ítems detallados. (Verifique configuración EAGER)</td></tr>`;
        }

        itemsHtml += '</tbody></table>';
        itemsContainer.innerHTML = itemsHtml;

    } catch (error) {
        itemsContainer.innerHTML = `<p style="color:red;">Error al cargar el detalle: ${error.message}</p>`;
        document.getElementById('detalle-cotizacion-container').style.display='block';
    }
}

function renderizarResumenCarrito() {
    const resumenDiv = document.getElementById('carrito-resumen');
    const totalItemsSpan = document.getElementById('item-count');
    const guardarBtn = document.getElementById('guardar-cotizacion-btn');

    totalItemsSpan.textContent = carrito.length;

    if (carrito.length === 0) {
        resumenDiv.innerHTML = '<p>Tu cotización está vacía.</p>';
        guardarBtn.disabled = true;
    } else {
        guardarBtn.disabled = false;
        let totalGeneral = 0;
        let html = '<ul style="list-style-type: disc; padding-left: 20px;">';

        carrito.forEach((item, index) => {
            const precioTotalItem = item.cantidad * item.precioUnitario;
            totalGeneral += precioTotalItem;

            html += `
                <li>
                    ${item.cantidad}x 
                    <strong>${item.mueble.nombre_mueble}</strong> 
                    (Var ID: ${item.variante.idVariante}, ${item.variante.descripcion}) 
                    -> $${precioTotalItem.toLocaleString('es-CL')}
                </li>
            `;
        });

        html += '</ul>';
        html += `<hr style="margin: 10px 0;"><h3>TOTAL ESTIMADO: $${totalGeneral.toLocaleString('es-CL')}</h3>`;
        resumenDiv.innerHTML = html;
    }
}

function renderizarListaMueblesExistentes(containerId, data, isRef = false) {
    const container = document.getElementById(containerId);
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:red;">No se encontraron muebles en el catálogo.</p>';
        return;
    }

    let html = '<table style="width:100%; border-collapse: collapse;"><thead><tr>';
    html += `<th>ID</th><th>Nombre</th><th>Tipo</th><th>Tamaño</th><th>Precio Base</th>`;
    if (!isRef) {
        html += `<th>Stock</th><th>Estado</th>`;
    }
    html += '</tr></thead><tbody>';

    data.forEach(mueble => {
        if (isRef && !mueble.activo) return;

        const estado = mueble.activo ? 'ACTIVO' : 'INACTIVO';
        const estilo = mueble.activo ? 'color: green;' : 'color: red; text-decoration: line-through;';

        html += `
            <tr style="border-bottom: 1px dashed #ccc;">
                <td>${mueble.id_mueble}</td>
                <td><span style="${estilo}">${mueble.nombre_mueble}</span></td>
                <td>${mueble.tipo}</td>
                <td>${mueble.tamano}</td>
                <td>$${mueble.precio_base.toLocaleString('es-CL')}</td>
        `;
        if (!isRef) {
            html += `<td><strong>${mueble.stock}</strong></td><td>${estado}</td>`;
        }
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderizarListaVariantesExistentes(containerId, data) {
    const container = document.getElementById(containerId);
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:red;">No se encontraron variantes.</p>';
        return;
    }

    let html = '<table style="width:100%; border-collapse: collapse;"><thead><tr>';
    html += `<th>ID</th><th>Descripción</th><th>Precio Adicional</th>`;
    html += '</tr></thead><tbody>';

    data.forEach(variante => {
        html += `
            <tr style="border-bottom: 1px dashed #ccc;">
                <td>${variante.idVariante}</td>
                <td>${variante.descripcion}</td>
                <td>+$${variante.precioAdicional.toLocaleString('es-CL')}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}


async function inicializarApp() {
    try {
        mueblesData = await fetchMuebles();
        variantesData = await fetchVariantes();
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
    }
    mostrarVista('admin');
}


document.getElementById('nav-admin-btn').addEventListener('click', () => mostrarVista('admin'));
document.getElementById('nav-sales-btn').addEventListener('click', () => mostrarVista('sales'));

document.getElementById('crear-mueble-btn').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre-mueble-input').value.trim();
    const tipo = document.getElementById('tipo-input').value.trim();
    const material = document.getElementById('material-select').value;
    const tamano = document.getElementById('tamano-select').value;
    const precioBase = parseInt(document.getElementById('precio-base-input').value);
    const stock = parseInt(document.getElementById('stock-input').value);

    if (!nombre || !tipo || isNaN(precioBase) || isNaN(stock) || precioBase < 0 || stock < 0) {
        mostrarMensaje('mensaje-creacion-mueble', 'ERROR: Complete todos los campos.', 'red');
        return;
    }
    mostrarMensaje('mensaje-creacion-mueble', 'Creando mueble...', 'blue');
    const nuevoMueble = { nombre_mueble: nombre, tipo: tipo, material: material, tamano: tamano, precio_base: precioBase, stock: stock, activo: true };

    try {
        const result = await createMuebleAPI(nuevoMueble);
        mostrarMensaje('mensaje-creacion-mueble', `Mueble creado! ID: ${result.id_mueble}, Nombre: ${result.nombre_mueble}`, 'green');
        inicializarApp();
    } catch (error) {
        mostrarMensaje('mensaje-creacion-mueble', `Error al crear: ${error.message}`, 'red');
    }
});

document.getElementById('mostrar-cotizaciones-pendientes-btn').addEventListener('click', async () => {
    document.getElementById('lista-cotizaciones-container').innerHTML = 'Cargando cotizaciones...';
    try {
        const cotizaciones = await fetchCotizacionesPendientes();
        renderizarListaCotizaciones(cotizaciones);
    } catch (error) {
        document.getElementById('lista-cotizaciones-container').innerHTML = `<p style="color:red;">Error al cargar cotizaciones: ${error.message}</p>`;
    }
});

// Admin, creación de variantes
document.getElementById('crear-variante-btn').addEventListener('click', async () => {
    const descripcion = document.getElementById('descripcion-variante-input').value.trim();
    const precioAdicional = parseInt(document.getElementById('precio-adicional-input').value);

    if (!descripcion || isNaN(precioAdicional) || precioAdicional < 0) {
        mostrarMensaje('mensaje-creacion-variante', 'ERROR: Complete todos los campos.', 'red');
        return;
    }
    mostrarMensaje('mensaje-creacion-variante', 'Creando variante...', 'blue');
    const nuevaVariante = { descripcion: descripcion, precioAdicional: precioAdicional };

    try {
        const result = await createVarianteAPI(nuevaVariante);
        mostrarMensaje('mensaje-creacion-variante', `Variante creada! ID: ${result.idVariante}, Descripción: ${result.descripcion}`, 'green');
        inicializarApp();
    } catch (error) {
        mostrarMensaje('mensaje-creacion-variante', `Error al crear: ${error.message}`, 'red');
    }
});

document.getElementById('mostrar-muebles-btn').addEventListener('click', async () => {
    document.getElementById('lista-muebles-container').innerHTML = 'Cargando datos...';
    try {
        mueblesData = await fetchMuebles();
        renderizarListaMueblesExistentes('lista-muebles-container', mueblesData, false);
    } catch (error) {
        document.getElementById('lista-muebles-container').innerHTML = `<p style="color:red;">Error al cargar lista: ${error.message}</p>`;
    }
});

document.getElementById('confirmar-venta-btn').addEventListener('click', async () => {
    const idCotizacion = parseInt(document.getElementById('id-cotizacion-input').value);

    if (isNaN(idCotizacion) || idCotizacion <= 0) {
        mostrarMensaje('mensaje-venta', 'Ingrese un ID de Cotización válido.', 'red');
        return;
    }
    mostrarMensaje('mensaje-venta', `Confirmando venta de Cotización #${idCotizacion}...`, 'blue');

    try {
        const result = await ejecutarConfirmacionVenta(idCotizacion);
        mostrarMensaje('mensaje-venta', `Venta confirmada! Stock descontado. Cotización ID: ${idCotizacion}`, 'green');
        inicializarApp();
    } catch (error) {
        mostrarMensaje('mensaje-venta', `Error al confirmar venta: ${error.message}`, 'red');
    }
});

document.getElementById('mostrar-muebles-ref-btn').addEventListener('click', async () => {
    document.getElementById('muebles-referencia-container').innerHTML = 'Cargando datos...';
    try {
        mueblesData = await fetchMuebles();
        renderizarListaMueblesExistentes('muebles-referencia-container', mueblesData, true);
    } catch (error) {
        document.getElementById('muebles-referencia-container').innerHTML = `<p style="color:red;">Error al cargar muebles: ${error.message}</p>`;
    }
});

document.getElementById('mostrar-variantes-ref-btn').addEventListener('click', async () => {
    document.getElementById('variantes-referencia-container').innerHTML = 'Cargando datos...';
    try {
        variantesData = await fetchVariantes();
        renderizarListaVariantesExistentes('variantes-referencia-container', variantesData);
    } catch (error) {
        document.getElementById('variantes-referencia-container').innerHTML = `<p style="color:red;">Error al cargar variantes: ${error.message}</p>`;
    }
});

// Ventas, añadir al carrito (Cotización)
document.getElementById('add-to-carrito-btn').addEventListener('click', () => {
    const muebleId = parseInt(document.getElementById('id-mueble-input-sales').value);
    const varianteId = parseInt(document.getElementById('id-variante-input').value);
    const cantidad = parseInt(document.getElementById('cantidad-cotizar-input').value);

    if (isNaN(muebleId) || isNaN(varianteId) || isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje('mensaje-cotizacion-item', 'Ingrese IDs y cantidad válidos.', 'red');
        return;
    }

    const mueble = mueblesData.find(m => m.id_mueble === muebleId);
    const variante = variantesData.find(v => v.idVariante === varianteId);

    if (!mueble) {
        mostrarMensaje('mensaje-cotizacion-item', `Mueble ID ${muebleId} no encontrado.`, 'red');
        return;
    }
    if (!variante) {
        mostrarMensaje('mensaje-cotizacion-item', `Variante ID ${varianteId} no encontrada.`, 'red');
        return;
    }
    if (cantidad > mueble.stock) {
        mostrarMensaje('mensaje-cotizacion-item', `Stock insuficiente. Máximo: ${mueble.stock}.`, 'red');
        return;
    }

    const precioUnitario = mueble.precio_base + variante.precioAdicional;

    const nuevoItem = { mueble: mueble, variante: variante, cantidad: cantidad, precioUnitario: precioUnitario };

    carrito.push(nuevoItem);
    renderizarResumenCarrito();
    mostrarMensaje('mensaje-cotizacion-item', `Añadido: ${cantidad}x ${mueble.nombre_mueble} (${variante.descripcion})`, 'green');

    document.getElementById('id-mueble-input-sales').value = '';
    document.getElementById('id-variante-input').value = '';
    document.getElementById('cantidad-cotizar-input').value = '1';
});


// Ventas, guardar cotización
document.getElementById('guardar-cotizacion-btn').addEventListener('click', async () => {
    if (carrito.length === 0) return;

    mostrarMensaje('mensaje-cotizacion', 'Guardando cotización...', 'blue');

    const cotizacionFinal = { total: 0, cotMuebles: carrito };

    try {
        const result = await enviarCotizacion(cotizacionFinal);
        mostrarMensaje('mensaje-cotizacion',
            `Cotización creada! ID: ${result.idCotizacion}. Total: $${result.total.toLocaleString('es-CL')}`,
            'green'
        );
        carrito = [];
        renderizarResumenCarrito();
    } catch (error) {
        mostrarMensaje('mensaje-cotizacion', `Error al guardar: ${error.message}`, 'red');
    }
});


window.onload = inicializarApp;