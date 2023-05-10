from ast import parse
from asyncio.proactor_events import _ProactorBaseWritePipeTransport
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib import request
from urllib.parse import parse_qs
import json
from foods_db import FoodsDB
from passlib.hash import bcrypt
from http import cookies
from session_store import SessionStore
import sys

SESSION_STORE = SessionStore()

class HttpHandler(BaseHTTPRequestHandler):
    #runs once per response
    def end_headers(self):
        self.send_cookie()
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
        super().end_headers()
        

    def load_cookie(self):
        if "Cookie" in self.headers:
            self.cookie = cookies.SimpleCookie(self.headers["Cookie"])
        else:
            self.cookie = cookies.SimpleCookie()

    def send_cookie(self):
        for morsel in self.cookie.values():
            #uncomment when using in chrome
            morsel["samesite"] = "None"
            morsel["secure"] = True
            self.send_header("Set-Cookie", morsel.OutputString())

    def load_session_data(self):
        self.load_cookie()

        if "sessionId" in self.cookie:
            sessionId = self.cookie["sessionId"].value
            self.sessionData = SESSION_STORE.loadSessionData(sessionId)

            if self.sessionData == None:
                sessionId = SESSION_STORE.createSession()
                self.sessionData = SESSION_STORE.loadSessionData(sessionId)
                self.cookie["sessionId"] = sessionId
        else:
            sessionId = SESSION_STORE.createSession()
            self.sessionData = SESSION_STORE.loadSessionData(sessionId)
            self.cookie["sessionId"] = sessionId
        print("MY SESSION DATA: ", self.sessionData)

    #if path = /choices
    def handleListItems(self):
        if "userId" not in self.sessionData:
            self.handle401()
            return
        db = FoodsDB()
        allRecords = db.getAllFoods()
         #send status code, 200 means all good
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(bytes(json.dumps(allRecords), "utf-8"))

    def handleGetOneFood(self, id):
        if "userId" not in self.sessionData:
            self.handle401()
            return
        db = FoodsDB()
        food = db.getOneFood(id)
        print(id)
        
        if food:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes(json.dumps(food), "utf-8"))
        else:
            self.handleNotFound()

    def handleCreateItem(self):
        if "userId" not in self.sessionData:
            self.handle401()
            return
        #add choice to choice list
        #read length from request header
        length = self.headers["Content-Length"]
        #tell the read how many bytes it needs to read
        #all requests are strings so need to make int
        request_body = self.rfile.read(int(length)).decode("utf-8")
        #turn request body to dictionary
        decoded_body = parse_qs(request_body)
        #decoded body is a dictionary so need to grab value

        print("raw request body:", decoded_body)
        #decoded body values come in lists so need to choose index
        name = decoded_body["name"][0]
        servingSize = decoded_body["servingSize"][0]
        calories = decoded_body["calories"][0]
        protein = decoded_body["protein"][0]
        fat = decoded_body["fat"][0]
        carbs = decoded_body["carbs"][0]

        db = FoodsDB() 
        db.createFood(name, servingSize, calories, protein, fat, carbs)

        self.send_response(201)
        self.end_headers()

    def handleCreateUser(self):
        length = self.headers["Content-Length"]
        request_body = self.rfile.read(int(length)).decode("utf-8")
        parsed_body = parse_qs(request_body)
        print(parsed_body)

        first_name = parsed_body["first_name"][0]
        last_name = parsed_body["last_name"][0]
        email = parsed_body["email"][0]
        password = parsed_body["password"][0]

        db = FoodsDB()
        if not db.findUserByEmail(email):
            encrypted_password = bcrypt.hash(password)
            db.createUser(first_name, last_name, email, encrypted_password)
            self.send_response(201)
            self.end_headers()
        else:
            self.send_response(422)
            self.end_headers()
        #user enters first n, last n, email, pass
        #use 422 code when making sure email is unique
        #encrypted_pass = bcrypt.hash(password)
        return
    
    def handleCreateDay(self):
        db = FoodsDB()
        db.createDay()
        self.send_response(201)
        self.end_headers()
        return

    def handleGetDay(self, id):
        if "dayId" not in self.sessionData:
            self.handle401()
            return
        db = FoodsDB()
        day = db.getDay(id)
        print(id)
        
        if day:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes(json.dumps(day), "utf-8"))
        else:
            self.handleNotFound()
        return
    
    def handleUpdateDay(self, id):
        if "dayId" not in self.sessionData:
            self.handle401()
            return
        length = self.headers["Content-Length"]
        request_body = self.rfile.read(int(length)).decode("utf-8")
        decoded_body = parse_qs(request_body)

        calories = decoded_body["calories"][0]
        protein = decoded_body["protein"][0]
        fat = decoded_body["fat"][0]
        carbs = decoded_body["carbs"][0]

        print("raw request body:", decoded_body)
        db = FoodsDB()
        day = db.getDay(id)
        
        if day:
            day = db.updateDay(calories, protein, fat, carbs, id)
            self.send_response(200)
            self.send_header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE")
            self.send_header("Access-Control-Allow-Headers","Content-Type")
            self.end_headers()
        else:
            self.handleNotFound()
        return
        return

    def handleCreateAuthSession(self): #let them login
        length = self.headers["Content-Length"]
        request_body = self.rfile.read(int(length)).decode("utf-8")
        parsed_body = parse_qs(request_body)
        #given attempted email and pass from client
        email = parsed_body["email"][0]
        password = parsed_body["password"][0]
        #check if that email exists in db
        db = FoodsDB()

        user = db.findUserByEmail(email)
        if user:#email matches
           if bcrypt.verify(password, user["password"]):#password matches
                self.send_response(201)
                self.end_headers()
                self.sessionData["userId"] = user["id"]
           else:#password doesnt match
                self.send_response(401)
                self.end_headers()
        else:#email doesnt match
            self.send_response(401)
            self.end_headers()
        return

    #if path not found
    def handleNotFound(self):
        self.send_response(404)
        self.end_headers()
        self.wfile.write(bytes('Path not found.', "utf-8"))

    def handle401(self):
        self.send_response(401)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(bytes('Resource not found.', "utf-8"))

    def handleDeleteItem(self, id):
        if "userId" not in self.sessionData:
            self.handle401()
            return
        db = FoodsDB()
        food = db.getOneFood(id)
        print(id)
        
        if food:
            food = db.deleteFood(id)
            self.send_response(200)
            self.send_header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE")
            self.send_header("Access-Control-Allow-Headers","Content-Type")
            self.end_headers()
        else:
            self.handleNotFound()
        return

    def handleCreateDay(self):
        length = self.headers["Content-Length"]
        request_body = self.rfile.read(int(length)).decode("utf-8")
        parsed_body = parse_qs(request_body)
        print(parsed_body)

        db = FoodsDB()

        db.createDay()
        self.send_response(201)
        self.end_headers()
        return

    def handleUpdateItem(self, id):
        if "userId" not in self.sessionData:
            self.handle401()
            return
        length = self.headers["Content-Length"]
        request_body = self.rfile.read(int(length)).decode("utf-8")
        decoded_body = parse_qs(request_body)

        name = decoded_body["name"][0]
        servingSize = decoded_body["servingSize"][0]
        calories = decoded_body["calories"][0]
        protein = decoded_body["protein"][0]
        fat = decoded_body["fat"][0]
        carbs = decoded_body["carbs"][0]

        print("raw request body:", decoded_body)
        db = FoodsDB()
        food = db.getOneFood(id)
        
        if food:
            food = db.updateFood(name, servingSize, calories, protein, fat, carbs, id)
            self.send_response(200)
            self.send_header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE")
            self.send_header("Access-Control-Allow-Headers","Content-Type")
            self.end_headers()
        else:
            self.handleNotFound()
        return

    def do_OPTIONS(self):
        self.load_session_data()
        self.send_response(200)
        self.send_header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers","Content-Type")
        self.end_headers()

    #get request
    def do_GET(self):
        self.load_session_data()
        print("request path: ", self.path)

        path_parts = self.path.split("/")
        print(path_parts)

        if len(path_parts) > 2:
            collection_name = path_parts[1]
            member_id = path_parts[2]
        else:
            collection_name = path_parts[1]
            member_id = None

        if collection_name == "foods":
            if member_id == None:
                self.handleListItems()
            else:
                self.handleGetOneFood(member_id)
        else:
            self.handleNotFound()

    def do_DELETE(self):
        self.load_session_data()
        print("request path: ", self.path)

        path_parts = self.path.split("/")
        print(path_parts)

        if len(path_parts) > 2:
            collection_name = path_parts[1]
            member_id = path_parts[2]
        else:
            collection_name = path_parts[1]
            member_id = None

        if collection_name == "foods":
            if member_id:
                self.handleDeleteItem(member_id)
            else:
                self.handleNotFound()
        else:
            self.handleNotFound()

    def do_PUT(self):
        self.load_session_data()
        #veryify that the path is correct
        #parse the body of request
        #send body of request to db to update item
        print("request path: ", self.path)

        path_parts = self.path.split("/")
        print(path_parts)

        if len(path_parts) > 2:
            collection_name = path_parts[1]
            member_id = path_parts[2]
        else:
            collection_name = path_parts[1]
            member_id = None

        if collection_name == "foods":
            if member_id:
                self.handleUpdateItem(member_id)
            else:
                self.handleNotFound()
        elif collection_name == "days":
            if member_id:
                self.handleUpdateDay(member_id)
            else:
                self.handleNotFound()
        else:
            self.handleNotFound()

    def do_POST(self):
        self.load_session_data()
        if self.path == '/foods':
            self.handleCreateItem()
        elif self.path == "/users":
            self.handleCreateUser()
        elif self.path == "/sessions":
            self.handleCreateAuthSession()
        elif self.path == '/days':
            self.handleCreateDay()
        else:
            self.handleNotFound()

def main():
    db = FoodsDB()
    db.createFoodsTable()
    db.createUsersTable()
    db.createDaysTable()
    db = None #disconnect db

    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    #tuple has the server address and the port number
    server = HTTPServer(("0.0.0.0", port), HttpHandler)
    print('Server running')
    server.serve_forever()

if __name__ == "__main__":
    main()