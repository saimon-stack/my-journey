let components = [];
let wires = [];
let nextId = 1;

let connectingState = {
    active: false,
    fromCompId: null,
    fromPinType: null,
    fromPinIndex: null,
    mouseX: 0,
    mouseY: 0
};

function initCanvas() {
    const canvas = document.getElementById('wireCanvas');
    const board = document.getElementById('board');
    if (!canvas || !board) return;

    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;
}

window.addEventListener('resize', () => {
    initCanvas();
    drawWires();
});

function getPinCenter(compId, pinType, pinIndex) {
    const pinEl = document.querySelector(`.pin[data-comp-id="${compId}"][data-pin-type="${pinType}"][data-pin-index="${pinIndex}"]`);
    if (!pinEl) return null;

    const boardRect = document.getElementById('board').getBoundingClientRect();
    const pinRect = pinEl.getBoundingClientRect();

    return {
        x: pinRect.left + pinRect.width / 2 - boardRect.left,
        y: pinRect.top + pinRect.height / 2 - boardRect.top
    };
}
function drawWires() {
    const canvas = document.getElementById('wireCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wires.forEach(wire => {
        const start = getPinCenter(wire.fromCompId, 'output', wire.fromPinIndex);
        const end = getPinCenter(wire.toCompId, 'input', wire.toPinIndex);

        if (start && end) {
            const sourceComp = components.find(c => c.id === wire.fromCompId);
            const isActive = sourceComp && sourceComp.outputValue === 1;
            drawBezierCurve(ctx, start.x, start.y, end.x, end.y, isActive);
        }
    });

    if (connectingState.active) {
        const start = getPinCenter(connectingState.fromCompId, connectingState.fromPinType, connectingState.fromPinIndex);
        if (start) {
            drawBezierCurve(ctx, start.x, start.y, connectingState.mouseX, connectingState.mouseY, false, true);
        }
    }
}

function drawBezierCurve(ctx, x1, y1, x2, y2, isActive = false, isDraft = false) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    const dx = Math.abs(x2 - x1) * 0.5;
    ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);

    ctx.lineWidth = 3;
    if (isDraft) {
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([6, 6]);
    } else {
        ctx.strokeStyle = isActive ? '#22c55e' : '#64748b';
        ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function handlePinClick(event, compId, pinType, pinIndex) {
    event.stopPropagation();

    if (!connectingState.active) {
        connectingState = {
            active: true,
            fromCompId: compId,
            fromPinType: pinType,
            fromPinIndex: pinIndex,
            mouseX: event.clientX,
            mouseY: event.clientY
        };
        return;
    }

    if (connectingState.active) {
        if (connectingState.fromCompId === compId || connectingState.fromPinType === pinType) {
            resetConnectingState();
            return;
        }

        let fromCompId, fromPinIndex, toCompId, toPinIndex;

        if (connectingState.fromPinType === 'output' && pinType === 'input') {
            fromCompId = connectingState.fromCompId;
            fromPinIndex = connectingState.fromPinIndex;
            toCompId = compId;
            toPinIndex = pinIndex;
        } else if (connectingState.fromPinType === 'input' && pinType === 'output') {
            fromCompId = compId;
            fromPinIndex = pinIndex;
            toCompId = connectingState.fromCompId;
            toPinIndex = connectingState.fromPinIndex;
        } else {
            resetConnectingState();
            return;
        }

        wires = wires.filter(w => !(w.toCompId === toCompId && w.toPinIndex === toPinIndex));

        // Thêm dây mới vào danh sách
        wires.push({ fromCompId, fromPinIndex, toCompId, toPinIndex });

        resetConnectingState();
        updateSimulation();
    }
}

function resetConnectingState() {
    connectingState.active = false;
    connectingState.fromCompId = null;
    drawWires();
}

document.addEventListener('mousemove', (e) => {
    if (connectingState.active) {
        const board = document.getElementById('board');
        const boardRect = board.getBoundingClientRect();
        connectingState.mouseX = e.clientX - boardRect.left;
        connectingState.mouseY = e.clientY - boardRect.top;
        drawWires();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetConnectingState();
});

document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('pin') && connectingState.active) {
        resetConnectingState();
    }
});

function addComponent(type, x = null, y = null) {
    const board = document.getElementById('board');
    if (!board) return;

    const currentId = nextId;
    const domId = `comp-${currentId}`;

    const newComponent = {
        id: currentId,
        type: type,
        inputValue1: 0,
        inputValue2: 0,
        outputValue: 0
    };

    components.push(newComponent);
    nextId++;

    const card = document.createElement('div');
    card.className = `component ${type.toLowerCase()}-card`;
    card.id = domId;

    let contentHTML = '';

    switch (type) {
        case 'SWITCH':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>Power Switch</h4>
                <button id="btn-${currentId}" class="toggle-btn" onclick="toggleSwitch(${currentId})">OFF</button>
                <div class="pin output-pin pin-center" data-comp-id="${currentId}" data-pin-type="output" data-pin-index="1" title="output"></div>
            `;
            break;
        case 'AND':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>AND Gate</h4>
                <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span id="out-${currentId}" class="out-val">OFF</span></div>
                <div class="pin input-pin pin-top" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="1" title="input 1"></div>
                <div class="pin input-pin pin-bottom" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="2" title="input 2"></div>
                <div class="pin output-pin pin-center" data-comp-id="${currentId}" data-pin-type="output" data-pin-index="1" title="output"></div>
            `;
            break;
        case 'OR':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>OR Gate</h4>
                <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span id="out-${currentId}" class="out-val">OFF</span></div>
                <div class="pin input-pin pin-top" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="1" title="input 1"></div>
                <div class="pin input-pin pin-bottom" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="2" title="input 2"></div>
                <div class="pin output-pin pin-center" data-comp-id="${currentId}" data-pin-type="output" data-pin-index="1" title="output"></div>
            `;
            break;
        case 'NOT':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>NOT Gate</h4>
                <div class="gate-status">Vào: OFF ➔ Ra: <span id="out-${currentId}" class="out-val on">ON</span></div>
                <div class="pin input-pin pin-center" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="1" title="input"></div>
                <div class="pin output-pin pin-center" data-comp-id="${currentId}" data-pin-type="output" data-pin-index="1" title="output"></div>
            `;
            break;
        case 'LED':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>LED Output</h4>
                <div id="led-${currentId}" class="led-light"></div>
                <div class="pin input-pin pin-center" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="1" title="input"></div>
            `;
            break;
        case 'XOR':
            contentHTML = `
        <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
        <h4>XOR Gate</h4>
        <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span id="out-${currentId}" class="out-val">OFF</span></div>
        <div class="pin input-pin pin-top" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="1" title="input 1"></div>
        <div class="pin input-pin pin-bottom" data-comp-id="${currentId}" data-pin-type="input" data-pin-index="2" title="input 2"></div>
        <div class="pin output-pin pin-center" data-comp-id="${currentId}" data-pin-type="output" data-pin-index="1" title="output"></div>
            `;
            break;
    }

    if (x !== null && y !== null) {
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
    } else {
        const offset = (components.length - 1) * 20;
        card.style.left = `${30 + offset}px`;
        card.style.top = `${30 + offset}px`;
    }

    card.onmousedown = function(event) {
        startDrag(event, card);
    };

    card.innerHTML = contentHTML;
    board.appendChild(card);

    card.querySelectorAll('.pin').forEach(pin => {
        pin.addEventListener('click', (e) => {
            const cId = parseInt(pin.getAttribute('data-comp-id'));
            const pType = pin.getAttribute('data-pin-type');
            const pIndex = parseInt(pin.getAttribute('data-pin-index'));
            handlePinClick(e, cId, pType, pIndex);
        });
    });

    initCanvas();
    updateSimulation();
}

function updateSimulation() {
    let changed = true;
    let maxIterations = 10; 

    while (changed && maxIterations > 0) {
        changed = false;
        maxIterations--;

        components.forEach(c => {
            if (c.type !== 'SWITCH') {
                c.inputValue1 = 0;
                c.inputValue2 = 0;
            }
        });

        wires.forEach(w => {
            const src = components.find(c => c.id === w.fromCompId);
            const dest = components.find(c => c.id === w.toCompId);
            if (src && dest) {
                if (w.toPinIndex === 1) dest.inputValue1 = src.outputValue;
                if (w.toPinIndex === 2) dest.inputValue2 = src.outputValue;
            }
        });

        components.forEach(c => {
            const oldOut = c.outputValue;
            if (c.type === 'AND') c.outputValue = (c.inputValue1 && c.inputValue2) ? 1 : 0;
            if (c.type === 'OR') c.outputValue = (c.inputValue1 || c.inputValue2) ? 1 : 0;
            if (c.type === 'NOT') c.outputValue = c.inputValue1 ? 0 : 1;
            if (c.type === 'XOR') c.outputValue = (c.inputValue1 !== c.inputValue2) ? 1 : 0;

            if (oldOut !== c.outputValue) changed = true;
        });
    }

    components.forEach(c => {
        const outSpan = document.getElementById(`out-${c.id}`);
        if (outSpan) {
            outSpan.innerText = c.outputValue ? 'ON' : 'OFF';
            outSpan.className = `out-val ${c.outputValue ? 'on' : ''}`;
        }

        const ledEl = document.getElementById(`led-${c.id}`);
        if (ledEl) {
            if (c.inputValue1) ledEl.classList.add('on');
            else ledEl.classList.remove('on');
        }

        
    });

    drawWires();
}

function toggleSwitch(id) {
    const idBtn = document.getElementById(`btn-${id}`);
    const choiceComponent = components.find(c => c.id === id);
    if (!choiceComponent) return;

    if (choiceComponent.outputValue === 0) {
        choiceComponent.outputValue = 1;
        idBtn.innerText = "ON";
        idBtn.classList.add("on");
    } else {
        choiceComponent.outputValue = 0;
        idBtn.innerText = "OFF";
        idBtn.classList.remove("on");
    }

    updateSimulation();
}

function startDrag(event, card) {
    if (event.target.closest('button') || event.target.classList.contains('pin')) {
        return;
    }
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();

    let shiftX = event.clientX - card.getBoundingClientRect().left;
    let shiftY = event.clientY - card.getBoundingClientRect().top;

    card.style.zIndex = 1000;

    function moveAt(pageX, pageY) {
        let newLeft = pageX - boardRect.left - shiftX;
        let newTop = pageY - boardRect.top - shiftY;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;

        card.style.left = newLeft + 'px';
        card.style.top = newTop + 'px';

        drawWires();
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
        card.style.zIndex = 10;
        drawWires();
    };
}

function clearBoard() {
    components = [];
    wires = [];
    nextId = 1;
    const board = document.getElementById('board');
    if (board) {
        board.innerHTML = '<canvas id="wireCanvas"></canvas>';
    }
    initCanvas();
}

function deleteComponent(id) {
    components = components.filter(com => com.id !== id);

    wires = wires.filter(w => w.fromCompId !== id && w.toCompId !== id);

    const elem = document.getElementById(`comp-${id}`);
    if (elem) elem.remove();

    updateSimulation();
}

function initSidebarDrag() {
    const toolButtons = document.querySelectorAll('.btn-tool');
    const board = document.getElementById('board');
    if (!board) return;

    toolButtons.forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            if (e.button && e.button !== 0) return;

            const type = btn.getAttribute('data-type');
            let isDragging = false;
            let ghostEl = null;

            const startX = e.clientX;
            const startY = e.clientY;

            function onPointerMove(moveEvent) {
                const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);

                if (!isDragging && dist > 5) {
                    isDragging = true;
                    ghostEl = document.createElement('div');
                    ghostEl.className = 'drag-ghost';
                    ghostEl.innerText = `${type} GATE`;
                    document.body.appendChild(ghostEl);
                }

                if (isDragging && ghostEl) {
                    ghostEl.style.left = `${moveEvent.clientX}px`;
                    ghostEl.style.top = `${moveEvent.clientY}px`;
                }
            }

            function onPointerUp(upEvent) {
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);

                if (ghostEl) ghostEl.remove();

                if (isDragging) {
                    const boardRect = board.getBoundingClientRect();
                    const dropX = upEvent.clientX;
                    const dropY = upEvent.clientY;

                    if (
                        dropX >= boardRect.left &&
                        dropX <= boardRect.right &&
                        dropY >= boardRect.top &&
                        dropY <= boardRect.bottom
                    ) {
                        let posX = dropX - boardRect.left - 105;
                        let posY = dropY - boardRect.top - 70;

                        if (posX < 0) posX = 0;
                        if (posY < 0) posY = 0;

                        addComponent(type, posX, posY);
                    }
                } else {
                    addComponent(type);
                }
            }

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        });
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSidebarDrag();
        initCanvas();
    });
} else {
    initSidebarDrag();
    initCanvas();
}