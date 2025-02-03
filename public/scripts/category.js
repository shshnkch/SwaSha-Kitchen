// fetch('/menu/categories')
//     .then(response => response.json())
//     .then(categories => {
//         const dropdown = document.getElementById('categoryDropdown');
//         categories.forEach(category => {
//             let option = document.createElement('option');
//             option.value = category;
//             option.textContent = category;
//             dropdown.appendChild(option);
//         });
//     })
//     .catch(error => console.error('Error fetching categories:', error));

fetch('/menu/categories')
    .then(response => response.json())
    .then(categories => {
        const dropdown = document.getElementById('categoryDropdown');
        categories.forEach(category => {
            let option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            if (category === '<%= selectedCategory %>') {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching categories:', error));
