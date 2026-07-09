// 1. Initialize state variable
        let isDarkMode = false;

        // 2. Select HTML elements
        const modeBtn = document.getElementById("mode-btn");

        // 3. Listen for click event
        modeBtn.addEventListener("click", function() {
            if (isDarkMode === false) {
                document.body.style.backgroundColor = '#1e293b';
                document.body.style.color = "#ffffff";
                modeBtn.textContent = "☀️ Light Mode";
                isDarkMode = true;
                
            } else {
                document.body.style.backgroundColor = "#ffffff";
                document.body.style.color = '#000000';
                modeBtn.textContent = "🌙 Dark Mode";
                isDarkMode = false;
            }
        });