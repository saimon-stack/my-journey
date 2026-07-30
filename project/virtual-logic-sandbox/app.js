let components = [];
let nextId = 1;

function addComponent(type) {
    const board = document.getElementById('board');
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
                <h4>Công tắc Nguồn</h4>
                <button id="btn-${currentId}" class="toggle-btn" onclick="toggleSwitch(${currentId})">OFF</button>
                <div class="pin output-pin pin-center" title="Đầu ra"></div>
            `;
            break;
        case 'AND':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>Cổng AND</h4>
                <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span class="out-val">OFF</span></div>
                <div class="pin input-pin pin-top" title="Đầu vào 1"></div>
                <div class="pin input-pin pin-bottom" title="Đầu vào 2"></div>
                <div class="pin output-pin pin-center" title="Đầu ra"></div>
            `;
            break;
        case 'OR':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>Cổng OR</h4>
                <div class="gate-status">Vào: OFF, OFF ➔ Ra: <span class="out-val">OFF</span></div>
                <div class="pin input-pin pin-top" title="Đầu vào 1"></div>
                <div class="pin input-pin pin-bottom" title="Đầu vào 2"></div>
                <div class="pin output-pin pin-center" title="Đầu ra"></div>
            `;
            break;
        case 'NOT':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>Cổng NOT</h4>
                <div class="gate-status">Vào: OFF ➔ Ra: <span class="out-val">ON</span></div>
                <div class="pin input-pin pin-center" title="Đầu vào"></div>
                <div class="pin output-pin pin-center" title="Đầu ra"></div>
            `;
            break;
        case 'LED':
            contentHTML = `
                <button class="delete-btn" onclick="deleteComponent(${currentId})">✕</button>
                <h4>Đèn LED</h4>
                <div id="led-${currentId}" class="led-light"></div>
                <div class="pin input-pin pin-center" title="Đầu vào"></div>
            `;
            break;
    }
    
    
    const offset = (components.length - 1) * 20;
    card.style.left = `${30 + offset}px`;
    card.style.top = `${30 + offset}px`;
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
    document.getElementById('board').innerHTML = '';
}

function deleteComponent(id) {
    components = components.filter(com => com.id !== id);
    const elem = document.getElementById(`comp-${id}`);
    if (elem) elem.remove();
}