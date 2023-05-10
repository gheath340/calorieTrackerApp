     //figure out how to add the cals and macros of the day to data
//and press button to start new day


//WHEN PAGE LOADS
    //load resource (get foods) probably doing this already
        //if response gave 200 status code
            //hide all login/register stuff, show normal stuff
        //if status code 401
            //show login/register, hide normal stuff
            //when user logs in start from top call function to load resource

const BASE_URL = "calorie-tracker-app.vercel.app"
                 //http://localhost:8080/
                 //
var itemList = []
//values
var calsConst = 0
var proteinConst = 0
var fatConst = 0
var carbsConst = 0
var itemId
//buttons
var addExisting = document.querySelector("#add-existing-button")
var addNew = document.querySelector('#add-new-button')
var newDay = document.querySelector('#new-day')
console.log("add new button query: ", addNew)
console.log("add existing button query: ", addExisting)

var modal = document.querySelector("#myModal")
var submitModal = document.querySelector("#submit-modal")

//say macro values are consts at top and put on site
//post those to server
//get those from server make those values the const variables and add the values just gotten from new food
//post new values to server


newDay.onclick = function () {
    var dayCals = document.querySelector("#day-cals")
    var dayProtein = document.querySelector("#day-protein")
    var dayFat = document.querySelector("#day-fat")
    var dayCarbs = document.querySelector("#day-carbs")
    dayCals.innerHTML = 0
    dayProtein.innerHTML = 0
    dayFat.innerHTML = 0
    dayCarbs.innerHTML = 0
}

addExisting.onclick = function () {
    //get selected food values
    var select = document.querySelector("#existing-items")
    var selectedFood = select.options[select.selectedIndex].value

    var servingsEaten = document.querySelector("#servings-eaten-input").value
    //calc how many cals/macros based of selected food and servings eaten
    //go into the list, find which dict has the name of selected food
    var cals
    var protein 
    var fat 
    var carbs
    for (var i = 0; i < itemList.length; i++) {
        var name = itemList[i]["name"]
        if (name == selectedFood) {
            cals = itemList[i]["calories"]
            protein = itemList[i]["protein"]
            fat = itemList[i]["fat"]
            carbs = itemList[i]["carbs"]
        }
    }
    calsConst += cals
    proteinConst += protein
    fatConst += fat
    carbsConst += carbs

    //add selected food values to daily calories and macros area
    //get protein fat and carbs and put value in
    var dayCals = document.querySelector("#cals-p")
    var dayProtein = document.querySelector("#protein-p")
    var dayFat = document.querySelector("#fat-p")
    var dayCarbs = document.querySelector("#carbs-p")

    dayCals.innerHTML = calsConst
    dayProtein.innerHTML = proteinConst
    dayFat.innerHTML = fatConst
    dayCarbs.innerHTML = carbsConst

}
//items in data are in list form for no reason, figure it out

var goToRegister = document.querySelector("#logRegisterbutton")
var loginButton = document.querySelector("#loginButton")

loginButton.onclick = function () {
    var email = document.querySelector('#emailInput').value
    var password = document.querySelector('#passwordInput').value

    login(email, password)
}

function login (email, password) {
    var data = "email=" + encodeURIComponent(email)
    data += "&password=" + encodeURIComponent(password)

    fetch(BASE_URL + "sessions", {
        method: "POST",
        credentials: "include",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        if (response.status == 404) {
            alert("Incorrect email or password")
        }else if (response.status == 201) {
            document.getElementById("loginDiv").style.display = "none"
            document.getElementById("mainDiv").style.display = "block"
            getData()
        }
    })

}

goToRegister.onclick = function () {
    document.getElementById("registerDiv").style.display = "block"
    document.getElementById("loginDiv").style.display = "none"
}

var submitRegistrationButton = document.querySelector("#regRegisterButton")

submitRegistrationButton.onclick = function() {
    var email = document.querySelector('#regEmailInput').value
    var password = document.querySelector('#regPasswordInput').value
    var fName = document.querySelector('#regFirstInput').value
    var lName = document.querySelector('#regLastInput').value
    
    createUser(email, password, fName, lName)
}


function createUser (email, password, fName, lName) {
    var data = "email=" + encodeURIComponent(email)
    data += "&password=" + encodeURIComponent(password)
    data += "&first_name=" + encodeURIComponent(fName)
    data += "&last_name=" + encodeURIComponent(lName)

    fetch(BASE_URL + "users", {
        method: "POST",
        credentials: "include",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        if (response.status == 422) {
            // message saying email is already taken
            alert("Email alreay taken")
            return;
        }else if (response.status == 201){
            //hide registration and show login
            document.getElementById("registerDiv").style.display = "none"
            document.getElementById("loginDiv").style.display = "block"
        }

    })
}

addNew.onclick = function () {
    var name = document.querySelector('#new-item-name').value
    var servingS = document.querySelector('#new-item-serving-size').value
    var cals = document.querySelector('#new-item-cals').value
    var protein = document.querySelector('#new-item-protein').value
    var fat = document.querySelector('#new-item-fat').value
    var carbs = document.querySelector('#new-item-carbs').value

    createItem(name, servingS, cals, protein, fat, carbs)
}

//create new item on server
function createItem (itemName, servingSize, calories, protein, fat, carbs) {
    var data = "name=" + encodeURIComponent(itemName)
    data += "&servingSize=" + encodeURIComponent(servingSize)
    data += "&calories=" + encodeURIComponent(calories)
    data += "&protein=" + encodeURIComponent(protein)
    data += "&fat=" + encodeURIComponent(fat)
    data += "&carbs=" + encodeURIComponent(carbs)
    

    fetch(BASE_URL + "foods", {
        method: "POST",
        credentials: "include",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }).then(function (response) {
        getData()
        //list of restaurants gets duplicated
    })

}

function deleteFood (id){
    fetch(BASE_URL + "foods/" + id, {
        method: "DELETE",
        credentials: "include",
    }).then(function (response) {
        if (response.status == 200) {
            console.log("Food was deleted")
            getData()
        }
    })
}

submitModal.onclick = function () {
    submitEdit(itemId)
}

function submitEdit (id) {

    var name = document.querySelector('#edit-item-name-val').value
    var servingS = document.querySelector('#edit-item-servings-val').value
    var cals = document.querySelector('#edit-item-calories-val').value
    var protein = document.querySelector('#edit-item-protein-val').value
    var fat = document.querySelector('#edit-item-fat-val').value
    var carbs = document.querySelector('#edit-item-carbs-val').value

    updateItem(name, servingS, cals, protein, fat, carbs, id)

    modal.style.display = "none"
}

function updateItem (itemName, servingSize, calories, protein, fat, carbs, id) {
    //get data from input fields in pop up window
    var data = "name=" + encodeURIComponent(itemName)
    data += "&servingSize=" + encodeURIComponent(servingSize)
    data += "&calories=" + encodeURIComponent(calories)
    data += "&protein=" + encodeURIComponent(protein)
    data += "&fat=" + encodeURIComponent(fat)
    data += "&carbs=" + encodeURIComponent(carbs)

    fetch(BASE_URL + "foods/" + id, {
        method: "PUT",
        credentials: "include",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }).then(function (response) {
        getData()
        //list of restaurants gets duplicated
    })
}

//data has 1 top list consisting of 2 lists, list[0] represents all existing items and list[1] represents items eaten today
function getData () {
    fetch(BASE_URL + "foods", {credentials: "include"}).then(function (response) {
        if (response.status == 401) {
            //hide data ui
            //show login or register
            document.getElementById("mainDiv").style.display = "none"
            document.getElementById("loginDiv").style.display = "block"
            return;
        }
        document.getElementById("loginDiv").style.display = "none"
        document.getElementById("mainDiv").style.display = "block"
        response.json().then(function (data) {
            itemList = data
            console.log("items from server: ", itemList)

            //stuff goes below this
            var listOfItems = document.querySelector("#existing-items") 
            console.log("list query: ", listOfItems)

    //empty list so it doesnt have it multiple times
            listOfItems.innerHTML = ""
            document.querySelector('#new-item-name').value = ""
            document.querySelector('#new-item-serving-size').value = ""
            document.querySelector('#new-item-cals').value  = ""
            document.querySelector('#new-item-protein').value = ""
            document.querySelector('#new-item-fat').value = ""
            document.querySelector('#new-item-carbs').value = ""
    //loop over list
            itemList.forEach(function (item) {

                var newListItem = document.createElement('li')
                newListItem.value = item["name"]
                newListItem.innerHTML = item["name"] + " " + item["servingsize"]
                newListItem.classList.add("list-items")

                //make add item button for each item
                var addButton = document.createElement("button")
                addButton.innerHTML = "Add item"
                addButton.classList.add("add-buttons")
                addButton.onclick = function () {


                }
                //make delete button child for each item
                var deleteButton = document.createElement("button")
                deleteButton.innerHTML = "Delete"
                deleteButton.classList.add("delete-buttons")
                deleteButton.onclick = function () {
                    console.log("Delete button pressed", item.id)
                    if (confirm("Are you sure?")) {   
                        deleteFood(item.id)
                    }
                }
                newListItem.appendChild(deleteButton)

                //make edit button for each item
                var editButton = document.createElement("button")
                editButton.innerHTML = "Edit"
                editButton.classList.add("edit-buttons")
                editButton.onclick = function () {
                    console.log("Edit button pressed", item.id)   
                        modal.style.display = "block"
                        itemId = item.id
                        document.querySelector('#edit-item-name-val').value = item["name"]
                        document.querySelector('#edit-item-servings-val').value = item["servingsize"]
                        document.querySelector('#edit-item-calories-val').value = item["calories"]
                        document.querySelector('#edit-item-protein-val').value = item["protein"]
                        document.querySelector('#edit-item-fat-val').value = item["fat"]
                        document.querySelector('#edit-item-carbs-val').value = item["carbs"]
                }
                newListItem.appendChild(editButton)
                listOfItems.appendChild(newListItem)
    })
            })
            
        })
    }


getData()