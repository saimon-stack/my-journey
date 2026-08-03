let components = [];
let nextId = 1;

function addComponent(type, x = null, y = null) {
    const board = document.getElementById('board');
    if (!board) return;

    const currentId = nextId; 
    const domId = `comp-${currentId}`;

    const newComponent = {
        id: currentId,
        type: type,
        sourceId1: null,
        sourceId2: null,
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
                <div class="pin output-pin pin-center" title="output"></div>
            `;
            break;
        case 'AND':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>AND Gate</h4>
                <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span class="out-val">OFF</span></div>
                <div class="pin input-pin pin-top" title="input 1"></div>
                <div class="pin input-pin pin-bottom" title="input 2"></div>
                <div class="pin output-pin pin-center" title="output"></div>
            `;
            break;
        case 'OR':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>OR Gate</h4>
                <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span class="out-val">OFF</span></div>
                <div class="pin input-pin pin-top" title="input 1"></div>
                <div class="pin input-pin pin-bottom" title="input 2"></div>
                <div class="pin output-pin pin-center" title="output"></div>
            `;
            break;
        case 'NOT':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>NOT Gate</h4>
                <div class="gate-status">Vào: OFF ➔ Ra: <span class="out-val">ON</span></div>
                <div class="pin input-pin pin-center" title="input"></div>
                <div class="pin output-pin pin-center" title="output"></div>
            `;
            break;
        case 'LED':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>LED Output</h4>
                <div id="led-${currentId}" class="led-light"></div>
                <div class="pin input-pin pin-center" title="input"></div>
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
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
        card.style.zIndex = 10;
    };
}

function clearBoard() {
    components = [];
    nextId = 1;
    const board = document.getElementById('board');
    if (board) {
        board.innerHTML = '<canvas id="wireCanvas"></canvas>';
    }
}

function deleteComponent(id) {
    components = components.filter(com => com.id !== id);
    const elem = document.getElementById(`comp-${id}`);
    if (elem) elem.remove();
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

                if (ghostEl) {
                    ghostEl.remove();
                }

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
                    // Nếu người dùng chỉ click nhanh tại chỗ mà không kéo -> Thêm linh kiện mặc định
                    addComponent(type);
                }
            }

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarDrag);
} else {
    initSidebarDrag();
}