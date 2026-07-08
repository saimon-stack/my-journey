// ==========================================
// BASIC DOM CHALLENGE
// ==========================================

// 1. Initialize a variable to hold the current count
let count = 0;

// Select the HTML elements using document.getElementById
    const clickBtn = document.getElementById("click-btn");
    const counterValue =  document.getElementById("counter-value");
// 2. Add an event listener to the button to listen for "click"
    clickBtn.addEventListener("click", function() {

            count++ ;
            counterValue.textContent = count;
    }
)