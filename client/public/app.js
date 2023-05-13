const BASE_URL = "http://localhost:8080/";
                       
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


newDay.onclick = function () {
    createDay()
}

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
        if (response.status == 401) {
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
    })

}

function createDay () {
    var na = ""
    var data = "data=" + encodeURIComponent(na)
    fetch(BASE_URL + "days", {
    method: "POST",
    credentials: "include",
    body: data,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}).then(function (response) {
    getData()
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
    })
}

function updateDay (id, calories, protein, fat, carbs) {
    var data = "calories=" + encodeURIComponent(calories)
    data += "&protein=" + encodeURIComponent(protein)
    data += "&fat=" + encodeURIComponent(fat)
    data += "&carbs=" + encodeURIComponent(carbs)

    fetch(BASE_URL + "days/" + id, {
        method: "PUT",
        credentials: "include",
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }).then(function (response) {
        //getData()
        getDay(id)
    })
}

function getDay(id) {
    fetch(BASE_URL + "days/" + id, {credentials: "include"}).then(function (response) {
        //get the current day info and fill day info
        if (response.status == 401) {
            //hide data ui
            //show login or register
            document.getElementById("mainDiv").style.display = "none"
            //document.getElementById("loginDiv").style.display = "block"
            return;
        }
        document.getElementById("loginDiv").style.display = "none"
        //document.getElementById("mainDiv").style.display = "block"
        response.json().then(function (data) {
            console.log("day from server: ", data)
            //display data in html
            console.log("calories: " + data['fat'])
            document.getElementById('cals-p').innerHTML = data['calories']
            document.getElementById('protein-p').innerHTML = data["protein"]
            document.getElementById('fat-p').innerHTML = data["fat"]
            document.getElementById('carbs-p').innerHTML  = data["carbs"]

        })
    })
}

function updateDayHTML(calories, protein, fat, carbs){
    var max = 0
    //get the current days id
    fetch(BASE_URL + "days", {credentials: "include"}).then(function (response) {
        response.json().then(function (data) {
            itemList = data
            console.log("days: ", itemList)
            itemList.forEach(function (item) {
                if(item["id"] > max) {
                    max = item["id"]
                }
            })
            updateDay(max, calories, protein, fat, carbs)

        })
    })
}

function initDay(){
    //get the max id of all items
    //set innerhtml to values of max id item
    var max = 0
    fetch(BASE_URL + "days", {credentials: "include"}).then(function (response) {
        response.json().then(function (data) {
            itemList = data
            console.log("days: ", itemList)
            itemList.forEach(function (item) {
                if(item["id"] > max) {
                    max = item["id"]
                }
            })
            console.log("max: " + max)
            itemList.forEach(function (item) {
                if (item["id"] == max) {
                    document.getElementById('cals-p').innerHTML = item['calories']
                    document.getElementById('protein-p').innerHTML = item["protein"]
                    document.getElementById('fat-p').innerHTML = item["fat"]
                    document.getElementById('carbs-p').innerHTML  = item["carbs"]
                }
            })
        })
    })
}

//data has 1 top list consisting of 2 lists, list[0] represents all existing items and list[1] represents items eaten today
function getData () {
    fetch(BASE_URL + "foods", {credentials: "include"}).then(function (response) {
        if (response.status == 401) {
            //hide data ui
            //show login or register
            document.getElementById("mainDiv").style.display = "none"
            //document.getElementById("loginDiv").style.display = "block"
            document.getElementById("registerDiv").style.display = "none"
            return;
        }
        document.getElementById("loginDiv").style.display = "none"
        //document.getElementById("mainDiv").style.display = "block"
        document.getElementById("registerDiv").style.display = "none"
        response.json().then(function (data) {
            itemList = data
            console.log("items from server: ", itemList)

            //stuff goes below this
            var listOfItems = document.querySelector("#existing-items") 
            console.log("list query: ", listOfItems)
    //display day info
            initDay()
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
                        //modal.style.display = "block"
                        itemId = item.id
                        document.querySelector('#edit-item-name-val').value = item["name"]
                        document.querySelector('#edit-item-servings-val').value = item["servingsize"]
                        document.querySelector('#edit-item-calories-val').value = item["calories"]
                        document.querySelector('#edit-item-protein-val').value = item["protein"]
                        document.querySelector('#edit-item-fat-val').value = item["fat"]
                        document.querySelector('#edit-item-carbs-val').value = item["carbs"]
                }
                newListItem.appendChild(editButton)
                //make add button for each item
                var addButton = document.createElement("button")
                addButton.innerHTML = "Add"
                addButton.classList.add("add-buttons")
                addButton.onclick = function () {
                    var calories = item["calories"]
                    var protein = item["protein"]
                    var fat = item["fat"]
                    var carbs = item["carbs"]

                    updateDayHTML(calories, protein, fat, carbs)
                }
                newListItem.appendChild(addButton)
                listOfItems.appendChild(newListItem)
    })
            })
            
        })
    }


getData()