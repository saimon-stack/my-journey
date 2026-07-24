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
                <h4>POWER SWITCH</h4>
                <button id="btn-${currentId}" class="toggle-btn" onclick="toggleSwitch(${currentId})">OFF</button>
            `;
            break;
        case 'AND':
            contentHTML = `
                <h4>AND GATE</h4>
                <div class="gate-status">Input: OFF, OFF ➔ Output: <span class="out-val">OFF</span></div>
            `;
            break;
        case 'OR':
            contentHTML = `
                <h4>OR GATE</h4>
                <div class="gate-status">Input: OFF, OFF ➔ Output: <span class="out-val">OFF</span></div>
            `;
            break;
        case 'NOT':
            contentHTML = `
                <h4>NOT GATE</h4>
                <div class="gate-status">Input: OFF ➔ Output: <span class="out-val">ON</span></div>
            `;
            break;
        case 'LED':
            contentHTML = `
                <h4>LED OUTPUT</h4>
                <div id="led-${currentId}" class="led-light"></div>
            `;
            break;
    }
    
    card.innerHTML = contentHTML;
    board.appendChild(card);
}

function clearBoard() {
    components = [];
    nextId = 1;
    document.getElementById('board').innerHTML = '';
}