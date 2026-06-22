function addtoCart() {
    const addedMessage = document.getElementById('added');
    addedMessage.classList.add('show');
    setTimeout( function() {
        addedMessage.classList.remove('show');
    }, 2000);
}
function buyNow() {
    const boughtMessage = document.getElementById('bought');
    boughtMessage.classList.add('show');
    setTimeout( function() {
        boughtMessage.classList.remove('show');
    }, 2000);
}