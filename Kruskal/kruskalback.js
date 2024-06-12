document.addEventListener('DOMContentLoaded', function() {
    var graph = new joint.dia.Graph();
    var paper = new joint.dia.Paper({
        el: document.getElementById('graficoContainer'),
        model: graph,
        width: 1100,
        height: 550,
        gridSize: 1,
        background: {
            image: 'image.png', // Ruta de la imagen del mapa
            size: 'contain' // Ajusta el tamaño de la imagen para que se contenga dentro del contenedor
        },
        interactive: function(cellView) {
            if (modoEdicion) {
                return { vertexAdd: false, labelMove: true };
            } else {
                return false;
            }
        },
        defaultLink: new joint.shapes.standard.Link({
            attrs: {
                line: {
                    stroke: document.getElementById('cambiarColorAristaBtn').value,
                    strokeWidth: 4,
                    targetMarker: null
                }
            }
        }),
        validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
            if (cellViewS === cellViewT) return false;
            var links = graph.getConnectedLinks(cellViewS.model);
            for (var i = 0; i < links.length; i++) {
                if (links[i].getTargetElement() === cellViewT.model || links[i].getSourceElement() === cellViewT.model) {
                    return false;
                }
            }
            return magnetT;
        },
        validateMagnet: function(cellView, magnet) {
            if (magnet.getAttribute('magnet') === 'passive') {
                return false;
            } else {
                return true;
            }
        },
        snapLinks: { radius: 75 },
        linkPinning: false,
        markAvailable: true
    });

    var modoEdicion = false;

    // Escala de la imagen en km por pixel (esto debe ser ajustado según la escala de tu imagen)
    var scaleKmPerPixel = 0.013; // Ejemplo: 1 pixel = 0.013 km

    function cambiarModoEdicion() {
        modoEdicion = !modoEdicion;
        paper.setInteractivity(function(cellView) {
            if (modoEdicion) {
                return { vertexAdd: false, labelMove: true };
            } else {
                return false;
            }
        });
    }

    function createNode(x, y, label) {
        var colorNodo = document.getElementById('cambiarColorBtn').value;
        var colorTexto = document.getElementById('cambiarColorTextoBtn').value;
        var nodeSize = Math.max(30, label.length * 10);
    
        var cell = new joint.shapes.standard.Circle({
            position: { x: x, y: y },
            size: { width: nodeSize, height: nodeSize },
            attrs: {
                body: {
                    fill: colorNodo,
                    stroke: 'black',
                    strokeWidth: 4,
                    magnet: true
                },
                label: {
                    text: label,
                    fill: colorTexto,
                    fontSize: 12,
                    textVerticalAnchor: 'middle',
                    textHorizontalAnchor: 'middle'
                }
            }
        });
        graph.addCell(cell);
        return cell;
    }

    paper.on('blank:pointerdown', function(evt, x, y) {
        if (modoEdicion) {
            // Coordenadas del área del aeropuerto (ajusta estos valores según la imagen)
            var airportArea = { x1: 300, y1: 200, x2: 570, y2: 240 };
            if (x >= airportArea.x1 && x <= airportArea.x2 && y >= airportArea.y1 && y <= airportArea.y2) {
                alert("No se pueden colocar nodos en el área del aeropuerto.");
                return;
            }
            var nodeName = prompt("Ingrese el nombre del nodo:");
            if (nodeName) {
                createNode(x, y, nodeName);
            }
        }
    });

    paper.on('link:connect', function(linkView) {
        var sourceElement = linkView.model.getSourceElement();
        var targetElement = linkView.model.getTargetElement();
        if (sourceElement && targetElement) {
            var sourcePosition = sourceElement.position();
            var targetPosition = targetElement.position();
            var distancePixels = Math.sqrt(Math.pow(targetPosition.x - sourcePosition.x, 2) + Math.pow(targetPosition.y - sourcePosition.y, 2));
            var distanceKm = (distancePixels * scaleKmPerPixel).toFixed(1);

            linkView.model.label(0, { 
                attrs: { 
                    text: { 
                        text: distanceKm,
                        fontWeight: 'bold',
                        fill: document.getElementById('cambiarColorTextoBtn').value, 
                        fontSize: 16,
                        textBackground: 'none',
                        strokeWidth: 0.25,
                        stroke: 'white'
                    },
                    rect: {
                        fill: 'none',
                        stroke: 'none'
                    }
                } 
            });
        } else {
            alert('El atributo debe ser un número.');
            linkView.model.remove();
        }
    });    

    paper.on('element:contextmenu', function(elementView, evt) {
        evt.preventDefault();
        if (modoEdicion) {
            const newName = prompt("Ingrese el nuevo nombre del nodo:");
            if (newName) {
                elementView.model.attr('label/text', newName);
                var nodeSize = Math.max(30, newName.length * 10);
                elementView.model.resize(nodeSize, nodeSize);
                elementView.model.attr('body/refWidth', '100%');
                elementView.model.attr('body/refHeight', '100%');
            }
        }
    });

    paper.on('link:contextmenu', function(linkView, evt) {
        evt.preventDefault();
        if (modoEdicion) {
            let newValue = prompt("Ingrese el nuevo valor para el atributo de la arista (solo números):");
            if (newValue && !isNaN(newValue)) {
                linkView.model.label(0, { attrs: { text: { text: newValue } } });
            } else if (newValue) {
                alert("Por favor, ingrese solo valores numéricos.");
            }
        }
    });

    document.querySelector('input[type="checkbox"]').addEventListener('change', cambiarModoEdicion);

    document.getElementById('volverColorOrig').addEventListener('click', function() {
        restaurarColoresOriginales();
        document.getElementById('resultado-container').innerText = '';
    });

    function restaurarColoresOriginales() {
        var edges = Object.values(graph.getLinks());
        edges.forEach(edge => {
            edge.attr('line/stroke', document.getElementById('cambiarColorAristaBtn').value);
            edge.attr('line/strokeWidth', 4);
        });
    }

    document.getElementById('solMinBtn').addEventListener('click', function() {
        restaurarColoresOriginales();
        var nodes = Object.values(graph.getElements());
        var isValidGraph = nodes.every(node => {
            var connectedLinks = graph.getConnectedLinks(node);
            return connectedLinks.length >= 2;
        });
    
        if (!isValidGraph) {
            alert("Todos los nodos deben tener al menos 2 aristas.");
            return;
        }
    
        calcularKruskal();
    });

    document.getElementById('direccionBtn').addEventListener('click', function() {
        window.location.href = 'https://www.google.com/maps/place/Distribuidor+Vial+Ceja/@-16.5043619,-68.1649087,17.75z/data=!4m14!1m7!3m6!1s0x915edfad500264a3:0xd57a8a6cf6dc4526!2sEl+Alto+International+Airport!8m2!3d-16.5094725!4d-68.1760585!16zL20vMDdydHp3!3m5!1s0x915edf6ec6b7563d:0xbc7e5a08cc7ebced!8m2!3d-16.5036467!4d-68.1626384!16s%2Fg%2F11rz2kltnr!5m1!1e1?entry=ttu';
    });

    function calcularKruskal() {
        var edges = Object.values(graph.getLinks());
        edges.sort((a, b) => a.labels()[0].attrs.text.text - b.labels()[0].attrs.text.text);
        
        var mstEdges = [];
        var unionFind = {};
        var sum = 0;
    
        function find(x) {
            if (unionFind[x] === undefined) {
                return x;
            }
            return find(unionFind[x]);
        }
    
        function union(x, y) {
            unionFind[find(x)] = find(y);
        }
    
        edges.forEach(edge => {
            var sourceId = edge.source().id;
            var targetId = edge.target().id;
            if (find(sourceId) !== find(targetId)) {
                union(sourceId, targetId);
                mstEdges.push(edge);
                sum += parseFloat(edge.labels()[0].attrs.text.text);
            }
        });
    
        var resultadoContainer = document.getElementById('resultado-container');
        resultadoContainer.textContent = mstEdges.map(edge => edge.labels()[0].attrs.text.text).join('+') + '=' + sum;
    
        mstEdges.forEach(edge => {
            edge.attr('line/stroke', '#fdff00');
            edge.attr('line/strokeWidth', 4);
        });
    
        paper.selectedEdges = mstEdges;
    }

    function maximizarKruskal() {
        var edges = Object.values(graph.getLinks());
        edges.sort((a, b) => b.labels()[0].attrs.text.text - a.labels()[0].attrs.text.text);
        
        var maxEdges = [];
        var unionFind = {};
        var sum = 0;
    
        function find(x) {
            if (unionFind[x] === undefined) {
                return x;
            }
            return find(unionFind[x]);
        }
    
        function union(x, y) {
            unionFind[find(x)] = find(y);
        }
    
        edges.forEach(edge => {
            var sourceId = edge.source().id;
            var targetId = edge.target().id;
            if (find(sourceId) !== find(targetId)) {
                union(sourceId, targetId);
                maxEdges.push(edge);
                sum += parseFloat(edge.labels()[0].attrs.text.text);
            }
        });
    
        var resultadoContainer = document.getElementById('resultado-container');
        resultadoContainer.textContent = maxEdges.map(edge => edge.labels()[0].attrs.text.text).join('+') + '=' + sum;
    
        maxEdges.forEach(edge => {
            edge.attr('line/stroke', '#fdff00');
            edge.attr('line/strokeWidth', 4);
        });
    
        paper.selectedEdges = maxEdges;
    }

    document.getElementById('solMaxBtn').addEventListener('click', function() {
        restaurarColoresOriginales();
        var nodes = Object.values(graph.getElements());
        var isValidGraph = nodes.every(node => {
            var connectedLinks = graph.getConnectedLinks(node);
            return connectedLinks.length >= 2;
        });
    
        if (!isValidGraph) {
            alert("Todos los nodos deben tener al menos 2 aristas para maximizar el grafo.");
            return;
        }
    
        maximizarKruskal();
    });

    document.getElementById('guardarBtn').addEventListener('click', function() {
        var nombreArchivo = prompt("Ingrese el nombre del archivo:");
        if (nombreArchivo) {
            var jsonData = JSON.stringify(graph.toJSON());
            var blob = new Blob([jsonData], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert("Por favor, ingrese un nombre válido para el archivo.");
        }
    });

    modoEliminar = false;

    document.getElementById('eliminarBtn').addEventListener('click', function() {
        modoEliminar = !modoEliminar;
        paper.el.style.cursor = 'crosshair';
        if (modoEliminar && !modoEdicion) {
            alert('Debes activar el modo de edición para eliminar.');
            modoEliminar = false;
            paper.el.style.cursor = 'default';
        } else if (!modoEliminar){
            paper.el.style.cursor = 'default';
        }
    });

    function cambiarModoEliminar() {
        modoEliminar = !modoEliminar;
        if (modoEliminar && !modoEdicion) {
            alert('Debes activar el modo de edición para entrar al modo de eliminar.');
            modoEliminar = false;
        }
    }

    paper.on('element:pointerclick', function(elementView) {
        if (modoEliminar && modoEdicion) {
            graph.removeCells([elementView.model]);
        }
    });

    paper.on('link:pointerclick', function(linkView) {
        if (modoEliminar && modoEdicion) {
            graph.removeCells([linkView.model]);
        }
    });

    document.getElementById('cargarBtn').addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                var jsonData = e.target.result;
                var data = JSON.parse(jsonData);
                graph.fromJSON(data);
            };
            reader.readAsText(file);
        };
        input.click();
    });

    document.getElementById('limpiarBtn').addEventListener('click', () => {
        graph.resetCells();
        document.getElementById('resultado-container').innerText = '';
    });
});
