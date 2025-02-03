function updateQuantity(button, increment) {
    const quantityInput = button.parentElement.querySelector('.quantity-input');
    const hiddenQuantityInput = button.closest('tr').querySelector('.hidden-quantity-input');

    let quantity = parseInt(quantityInput.value);
    quantity = isNaN(quantity) ? 1 : quantity;
    quantity += increment;

    if (quantity < 1) quantity = 1;

    quantityInput.value = quantity;
    hiddenQuantityInput.value = quantity;

    console.log('Visible Quantity Input:', quantityInput.value);
    console.log('Hidden Quantity Input:', hiddenQuantityInput.value);
}

function validateAndLog(form) {
    const hiddenQuantityInput = form.querySelector('.hidden-quantity-input');
    console.log('Final Quantity:', hiddenQuantityInput.value);
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const hiddenQuantityInput = form.querySelector('.hidden-quantity-input');
        console.log('Quantity on Submit:', hiddenQuantityInput.value);
        form.submit();
    });
});