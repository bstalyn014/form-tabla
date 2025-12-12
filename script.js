// Datos de la tabla
const services = [
    { codigo: "600271", descripcion: "Prueba de consumo hasta 4 unidades funcionales", valor: 7.83 },
    { codigo: "600273", descripcion: "Prueba de consumo entre 5 y 10 unidades funcionales", valor: 18.80 },
    { codigo: "600274", descripcion: "Prueba de consumo hasta 11 y 20 unidades funcionales", valor: 23.51 },
    { codigo: "600275", descripcion: "Prueba de consumo hasta 21 y 30 unidades funcionales", valor: 31.34 },
    { codigo: "600276", descripcion: "Prueba de consumo hasta 31 y 50 unidades funcionales", valor: 47.01 },
    { codigo: "600277", descripcion: "Prueba de consumo desde 51 unidades funcionales", valor: 62.68 },
    { codigo: "600281", descripcion: "Prueba de Geófono (por hora/fracción y unidad funcional)", valor: 15.67 },
    { codigo: "597753", descripcion: "Reparación fugas no visibles rotura 70cm x 70cm", valor: 71.30 },
    { codigo: "597754", descripcion: "Reparación fugas no visibles rotura 40cm x 40cm", valor: 53.32 },
    { codigo: "597755", descripcion: "Reparación fugas no visibles adicional rotura 70cm x 70cm", valor: 55.99 },
    { codigo: "597756", descripcion: "Reparación fugas no visibles adicional rotura 40cm x 40cm", valor: 42.47 },
    { codigo: "672538", descripcion: "Cambio Válvula Esférica FV paso sobrepuesta", valor: 22.91 },
    { codigo: "597758", descripcion: "Cambio de flapper y herraje", valor: 32.55 },
    { codigo: "672539", descripcion: "Cambio de boya de 1/2\" y 3/4\"", valor: 30.80 },
    { codigo: "597760", descripcion: "Cambio de flapper", valor: 12.70 },
    { codigo: "672540", descripcion: "Cambio de boya de 1\"", valor: 46.11 },
    { codigo: "597762", descripcion: "Cambio serpentina inodoro", valor: 31.25 },
    { codigo: "597764", descripcion: "Cambio válvula esférica", valor: 27.61 }
];

// Referencias a elementos del DOM
const tableBody = document.getElementById('table-body');
const totalAmountElement = document.getElementById('total-amount');
const itemsCountElement = document.getElementById('items-count');
const currentDateElement = document.getElementById('current-date');
const generatePdfButton = document.getElementById('generate-pdf');
const resetFormButton = document.getElementById('reset-form');

// Variable para almacenar los totales por fila
let rowTotals = [];

// Función para formatear números como moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    }).format(value);
}

// Función para actualizar el total general
function updateTotal() {
    let total = 0;
    let itemsWithQuantity = 0;
    
    rowTotals.forEach(item => {
        total += item.total;
        if (item.quantity > 0) {
            itemsWithQuantity++;
        }
    });
    
    totalAmountElement.textContent = formatCurrency(total);
    itemsCountElement.textContent = itemsWithQuantity;
}

// Función para crear la tabla
function createTable() {
    tableBody.innerHTML = '';
    rowTotals = [];
    
    services.forEach((service, index) => {
        // Crear fila
        const row = document.createElement('tr');
        
        // Crear celdas
        const codigoCell = document.createElement('td');
        codigoCell.textContent = service.codigo;
        
        const descripcionCell = document.createElement('td');
        descripcionCell.textContent = service.descripcion;
        
        const valorCell = document.createElement('td');
        valorCell.textContent = formatCurrency(service.valor);
        
        const cantidadCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = ''; // Campo vacío en lugar de 0
        input.placeholder = '0';
        input.className = 'cantidad-input';
        input.dataset.index = index;
        
        // Evento para actualizar cuando cambia la cantidad
        input.addEventListener('input', function() {
            const idx = parseInt(this.dataset.index);
            const quantity = parseInt(this.value) || 0; // Si está vacío, será 0
            updateRowTotal(idx, quantity);
        });
        
        // Evento para cuando el campo pierde el foco
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = '';
            }
        });
        
        cantidadCell.appendChild(input);
        
        const totalCell = document.createElement('td');
        totalCell.className = 'valor-total';
        totalCell.textContent = formatCurrency(0);
        
        // Agregar celdas a la fila
        row.appendChild(codigoCell);
        row.appendChild(descripcionCell);
        row.appendChild(valorCell);
        row.appendChild(cantidadCell);
        row.appendChild(totalCell);
        
        // Agregar fila a la tabla
        tableBody.appendChild(row);
        
        // Inicializar el array de totales
        rowTotals.push({
            index: index,
            unitValue: service.valor,
            quantity: 0,
            total: 0
        });
    });
    
    updateTotal();
}

// Función para actualizar el total de una fila
function updateRowTotal(index, quantity) {
    if (rowTotals[index]) {
        rowTotals[index].quantity = quantity;
        rowTotals[index].total = rowTotals[index].unitValue * quantity;
        
        // Actualizar la celda en la tabla
        const rows = tableBody.querySelectorAll('tr');
        if (rows[index]) {
            const totalCell = rows[index].querySelector('.valor-total');
            totalCell.textContent = formatCurrency(rowTotals[index].total);
        }
        
        updateTotal();
    }
}

// Función para generar el PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Tabla de Servicios de Reparaciones Internas - Valores Totales", 14, 20);
    
    // Fecha
    doc.setFontSize(10);
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha: ${dateStr}`, 14, 30);
    
    // Encabezado de la tabla
    const headers = [
        ["Código", "Descripción", "Valor Unitario", "Cantidad", "Valor Total"]
    ];
    
    // Datos de la tabla - Solo incluir servicios con cantidad > 0
    const data = [];
    let totalGeneral = 0;
    let itemsWithQuantity = 0;
    
    rowTotals.forEach(item => {
        if (item.quantity > 0) {
            data.push([
                services[item.index].codigo,
                services[item.index].descripcion,
                formatCurrency(item.unitValue),
                item.quantity.toString(),
                formatCurrency(item.total)
            ]);
            totalGeneral += item.total;
            itemsWithQuantity++;
        }
    });
    
    // Si no hay items con cantidad, mostrar un mensaje
    if (itemsWithQuantity === 0) {
        data.push(["No hay servicios con cantidades ingresadas", "", "", "", ""]);
    } else {
        // Agregar fila de total general
        data.push(["", "", "", "TOTAL:", formatCurrency(totalGeneral)]);
    }
    
    // Generar la tabla
    doc.autoTable({
        head: headers,
        body: data,
        startY: 40,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250]
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 70 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30 }
        },
        didDrawPage: function(data) {
            // Número de página
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(
                `Página ${data.pageNumber} de ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
    });
    
    // Guardar el PDF
    const fileName = `servicios_${today.getFullYear()}_${today.getMonth()+1}_${today.getDate()}.pdf`;
    doc.save(fileName);
}

// Función para reiniciar el formulario
function resetForm() {
    const inputs = document.querySelectorAll('.cantidad-input');
    inputs.forEach(input => {
        input.value = ''; // Vaciar el campo en lugar de poner 0
        const idx = parseInt(input.dataset.index);
        updateRowTotal(idx, 0);
    });
    
    updateTotal();
    
    // Mostrar mensaje de confirmación
    alert("Todos los campos han sido limpiados. Los totales se han reiniciado a cero.");
}

// Función para establecer la fecha actual
function setCurrentDate() {
    const today = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    currentDateElement.textContent = today.toLocaleDateString('es-ES', options);
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    createTable();
    setCurrentDate();
    
    // Event listeners para los botones
    generatePdfButton.addEventListener('click', generatePDF);
    resetFormButton.addEventListener('click', resetForm);
    
    // Mensaje de confirmación al generar PDF
    generatePdfButton.addEventListener('click', function() {
        const itemsWithQuantity = rowTotals.filter(item => item.quantity > 0).length;
        if (itemsWithQuantity === 0) {
            alert("No hay servicios con cantidades ingresadas. El PDF se generará con un mensaje indicando que no hay datos.");
        }
    });
});