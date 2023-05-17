const BASE_URL = "http://localhost:8080/";
//buttons
var addExisting = document.querySelector("#add-existing-button")
var addNew = document.querySelector('#add-new-button')
var newDay = document.querySelector('#new-day')

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

function divDisplayToFlex(divID) {
    if (divID === "loginDiv") {
        document.getElementById("mainDiv").style.display = "none"
        document.getElementById("loginDiv").style.display = "flex"
        document.getElementById("registerDiv").style.display = "none"
        document.getElementById("editScreen").style.display = "none"
    }
    if (divID === "mainDiv") {
        document.getElementById("mainDiv").style.display = "flex"
        document.getElementById("loginDiv").style.display = "none"
        document.getElementById("registerDiv").style.display = "none"
        document.getElementById("editScreen").style.display = "none"
    }
    if (divID === "registerDiv") {
        document.getElementById("mainDiv").style.display = "none"
        document.getElementById("loginDiv").style.display = "none"
        document.getElementById("registerDiv").style.display = "flex"
        document.getElementById("editScreen").style.display = "none"
    }
    if (divID === "editScreen") {
        document.getElementById("mainDiv").style.display = "none"
        document.getElementById("loginDiv").style.display = "none"
        document.getElementById("registerDiv").style.display = "none"
        document.getElementById("editScreen").style.display = "flex"
    }

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
            divDisplayToFlex("mainDiv")
            getData()
        }
    })

}

goToRegister.onclick = function () {
    divDisplayToFlex("registerDiv")
}

var submitRegistrationButton = document.querySelector("#regRegisterButton")

submitRegistrationButton.onclick = function() {
    var email = document.querySelector('#regEmailInput').value
    var password = document.querySelector('#regPasswordInput').value
    var fName = document.querySelector('#regFirstInput').value
    var lName = document.querySelector('#regLastInput').value
    
    createUser(email, password, fName, lName)
}

var registrationBackButton = document.querySelector("#regBackButton")

registrationBackButton.onclick = function() {
    divDisplayToFlex("loginDiv")
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
            divDisplayToFlex("loginDiv")
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

var submitEditButton = document.getElementById("submit-edit")

submitEditButton.onclick = function () {
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

    var editScreen = document.getElementById("editScreen").style.display = "none"
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
        getData()
        //getDay(id)
    })
}

function getDay(id) {
    fetch(BASE_URL + "days/" + id, {credentials: "include"}).then(function (response) {
        //get the current day info and fill day info
        if (response.status == 401) {

            divDisplayToFlex("loginDiv")
            return;
        }
        divDisplayToFlex("mainDiv")
        response.json().then(function (data) {
            //display data in html
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
            itemList.forEach(function (item) {
                if(item["id"] > max) {
                    max = item["id"]
                }
            })
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

function addButtonClasses(button) {
    button.classList.add("rounded-md")
    button.classList.add("bg-sky-900")
    button.classList.add("hover:bg-sky-700")
    button.classList.add("p-1")
    button.classList.add("text-white")
    button.classList.add("w-1/4")
    button.classList.add("text-xs")
    button.classList.add("xl:text-base")
}

function createAddButton(item) {
    var addButton = document.createElement("button")
    addButton.innerHTML = "Add"
    addButton.classList.add("add-buttons")
    addButtonClasses(addButton)
    addButton.onclick = function () {
        var calories = item["calories"]
        var protein = item["protein"]
        var fat = item["fat"]
        var carbs = item["carbs"]

        updateDayHTML(calories, protein, fat, carbs)
    }
    return addButton
}

function createEditButton(item) {
    var editButton = document.createElement("button")
    editButton.innerHTML = "Edit"
    editButton.classList.add("edit-buttons")
    addButtonClasses(editButton)
    editButton.onclick = function () {
        divDisplayToFlex("editScreen")
        itemId = item.id
        document.querySelector('#edit-item-name-val').value = item["name"]
        document.querySelector('#edit-item-servings-val').value = item["servingsize"]
        document.querySelector('#edit-item-calories-val').value = item["calories"]
        document.querySelector('#edit-item-protein-val').value = item["protein"]
        document.querySelector('#edit-item-fat-val').value = item["fat"]
        document.querySelector('#edit-item-carbs-val').value = item["carbs"]
    }
    return editButton
}

function createDeleteButton(item) {
    var deleteButton = document.createElement("button")
    deleteButton.innerHTML = "Delete"
    deleteButton.classList.add("delete-buttons")
    addButtonClasses(deleteButton)
    deleteButton.onclick = function () {
        if (confirm("Are you sure?")) {   
            deleteFood(item.id)
        }
    }
    return deleteButton
}

//data has 1 top list consisting of 2 lists, list[0] represents all existing items and list[1] represents items eaten today
function getData () {
    fetch(BASE_URL + "foods", {credentials: "include"}).then(function (response) {
        if (response.status == 401) {
            //hide data ui
            //show login or register
            divDisplayToFlex("loginDiv")
            return;
        }
        divDisplayToFlex("mainDiv")
        response.json().then(function (data) {
            itemList = data
            //stuff goes below this
            var listOfItems = document.querySelector("#existing-items") 
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
                newListItem.classList.add("list-items")
                newListItem.classList.add("text-xl")
                var newLabel = document.createElement("label")
                newLabel.innerHTML = item["name"] + " " + item["servingsize"]
                newListItem.appendChild(newLabel)

                var newListItem2 = document.createElement('li')
                newListItem2.classList.add("list-items")
                newListItem2.classList.add("flex")
                newListItem2.classList.add('justify-evenly')
                newListItem2.classList.add("w-3/4")

                newListItem2.appendChild(createDeleteButton(item))
                newListItem2.appendChild(createEditButton(item))
                newListItem2.appendChild(createAddButton(item))
                
                listOfItems.appendChild(newListItem)
                listOfItems.appendChild(newListItem2)
    })
            })
            
        })
    }


getData()