// document.getElementsByClassName("menuaddition")
let selectedCategory = document.getElementById("categorydropdown");
selectedCategory.onchange = selectCategory;

let addCategory = document.getElementById("addcategory");
addCategory.onclick = addingCategory;

let addItem = document.getElementById("additem");
addItem.onclick = addingItem;

let save = document.getElementById("save");
save.onclick = saveRestaurant;

//actually just using the value of the dropdown instead
// let catSelectClicked = false;
// const catSelection = document.getElementById("newitemcat");
// catSelection.addEventListener('click', function() {
//         catSelectClicked = true;
//     });

function selectCategory() {
    let category = selectedCategory.value;
    let menuItems = window.restaurantData.menu[category];

    let div = document.getElementById("menuitems");
    div.innerHTML = "";

    for(let menuItem in menuItems) {
        let item = menuItems[menuItem];
        let p = document.createElement("p");
        p.innerHTML = `${menuItem}: ${item.name} - $${item.price} <br> ${item.description}`;
        div.appendChild(p);
    }
}

function renderMenu() {
    let menuBlock = document.getElementById("entiremenu");
    menuBlock.innerHTML = "";

    for (let category in window.restaurantData.menu) {
        let h3 = document.createElement("h3");
        h3.textContent = category;
        menuBlock.appendChild(h3);
        
        let ul = document.createElement("ul");
        for (let itemInCat in window.restaurantData.menu[category]) {
            let itemID = document.createElement("b");
            itemID.textContent = `${itemInCat}`;
            ul.appendChild(itemID);

            let item = window.restaurantData.menu[category][itemInCat];
            let li = document.createElement("li");
            li.innerHTML = `${item.name} -$${item.price} <br> ${item.description}`;
            ul.appendChild(li);
        }
        menuBlock.appendChild(ul);
    }
    selectCategory();
}

function addingCategory() {
    let newCategory = document.getElementById("newcategory").value;
    if (!newCategory) {
        alert("Category left empty");
        return;
    }
    for (let category in window.restaurantData.menu) {
        if (newCategory == category) {
            alert("Duplicate categories not allowed");
            return;
        }
    }
    
    let dropdowns = [
        categoryDropdown = document.getElementById("categorydropdown"),
        newItemCategoryDropdown = document.getElementById("newitemcat")
    ]
    for (let dropdown of dropdowns) {
        let dropdownOption = document.createElement("option");
        dropdownOption.value = newCategory;
        dropdownOption.textContent = newCategory;
        dropdown.appendChild(dropdownOption);
    }
    // issues with adding same DOM node to the two dropdowns, needed to create one node per
    // let categoryDropdown = document.getElementById("categorydropdown");
    // let dropdownOption = document.createElement("option");
    // dropdownOption.value = newCategory;
    // dropdownOption.textContent = newCategory;
    // categoryDropdown.appendChild(dropdownOption);
    // let newItemCategoryDropdown = document.getElementById("newitemcat");
    // newItemCategoryDropdown.append(dropdownOption);

    //prepping things locally:
    //adding new key to the object 'menu' within JS obj 'window.restaurantData' - all locally stored
    window.restaurantData.menu[newCategory] = {};
    document.getElementById("newcategory").value = "";
    categoryDropdown.value = newCategory;
    document.getElementById("menuitems").innerHTML = "";

    renderMenu();
}

function nextItemId() {
    let id = -1;
    for (let category in window.restaurantData.menu) {
        let items = window.restaurantData.menu[category];
        for (let currId in items) {
            let numericCurrId = Number(currId);
            if (numericCurrId > id) {
                id = numericCurrId;
            }
        }
    }
    //first item adding at id 0
    // if (id == 0) {
    //     return 0;
    // }
    return id + 1;
}

function addingItem() {
    let name = document.getElementById("newname").value;
	let description = document.getElementById("newdescription").value;
    let price = document.getElementById("newprice").value;
    let category = document.getElementById("newitemcat").value
	if(!name || !description || !price || !category){
		alert("You must enter all the item details");
		return;
	}
    
    let items = window.restaurantData.menu[category];
    let newItemId = nextItemId();

    window.restaurantData.menu[category][newItemId] = {
        name, description, price
    };

    renderMenu();
}

async function saveRestaurant(){
    //what we didn't have attached to a 'submit' type button
    let restoName = document.getElementById("restoname").value;
    let restoDeliveryFee = document.getElementById("restofee").value;
    let restoMinOrder = document.getElementById("restomin").value;
    if(!restoName || !restoDeliveryFee || !restoMinOrder){
		alert("You must enter all the restaurant details");
		return;
	}

	window.restaurantData.name = restoName;
    window.restaurantData.delivery_fee = restoDeliveryFee;
    window.restaurantData.min_order = restoMinOrder;

	let restaurant = window.restaurantData;

    //sending request to server and awaiting a response object
    let response = await fetch(`/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(restaurant)
    });

    if (response.ok) {
        alert("Restaurant saved!")
    } else {
        alert("Error in saving restaurant");
    }
}
