
let submit = document.getElementById("submit");
submit.onclick = submitRestaurant;


async function submitRestaurant(){
	let name = document.getElementById("name").value;
	let delivery_fee = document.getElementById("deliveryfee").value;
    let min_order = document.getElementById("minimumorder").value;
	if(name.length == 0 || delivery_fee.length == 0 || min_order.length == 0){
		alert("You must enter all the restaurant details");
		return;
	}

	let restaurant = {name, delivery_fee, min_order};
	// console.log(restaurant);

    //sending request to server and awaiting a response object
    const response = await fetch("/restaurants", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(restaurant)
    });

    if (response.ok) {
        let newRestaurant = await response.json();
        window.location.href = "/restaurants/" + newRestaurant.id;
    } else {
        alert("Error in creating a new restaurant");
    }
}
