import os
import psycopg2
import psycopg2.extras
import urllib.parse
from datetime import date

#create new table for logins (first name, last name, email, ecrypted password)
class FoodsDB:
    def __init__(self):
        # urllib.parse.uses_netloc.append("postgres")
        # print(os.environ)
        # url = urllib.parse.urlparse(os.environ["DATABASE_URL"])

        # self.connection = psycopg2.connect(
        #     cursor_factory=psycopg2.extras.RealDictCursor,
        #     database=url.path[1:],
        #     user=url.username,
        #     password=url.password,
        #     host=url.hostname,
        #     port=url.port
        # )
        self.connection = psycopg2.connect(
            cursor_factory = psycopg2.extras.RealDictCursor,
            database = "calorietracker",
            user = "garrettheath",
            password = "Floop340",
            host = "localhost")

        self.cursor = self.connection.cursor()

    def __del__(self):
        self.connection.close()

    def createFoodsTable(self):
        self.cursor.execute("CREATE TABLE IF NOT EXISTS foods (id SERIAL PRIMARY KEY, name TEXT, servingSize TEXT, calories TEXT, protein TEXT, fat TEXT, carbs TEXT)")
        self.connection.commit()

    def createUsersTable(self):
        self.cursor.execute("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT, password TEXT)")
        self.connection.commit()

    def createDaysTable(self):
        self.cursor.execute("CREATE TABLE IF NOT EXISTS days (id SERIAL PRIMARY KEY, calories TEXT, protein TEXT, fat TEXT, carbs TEXT)")
        self.connection.commit()

    def getAllFoods(self):
        #no inputs
        #gives a list of all items
        self.cursor.execute("SELECT * FROM foods")

        return self.cursor.fetchall() 

    def getOneFood(self, food_id): 
        # needs food id
        # gives item associated with input id
        data = [food_id]
        self.cursor.execute("SELECT * FROM foods WHERE id = %s", data)
        return self.cursor.fetchone()

    def createFood(self, name, servingSize, calories, protein, fat, carbs): 
        # needs servingSize, calories, protein, fat, carbs
        # gives nothing(only side effect)                  do not just concatonate strings to add variables, security risk
        data = [name, servingSize, calories, protein, fat, carbs]
        self.cursor.execute("INSERT INTO foods (name, servingSize, calories, protein, fat, carbs) VALUES (%s, %s, %s, %s, %s, %s)", data)
        #commit is a save
        #commit after any write operation
        self.connection.commit()

    def updateFood(self, name, servingSize, calories, protein, fat, carbs, id):
        # needs id, servingSize, calories, protein, fat, carbs
        # gives nothing(only side effect)
        data = [name, servingSize, calories, protein, fat, carbs, id]
        self.cursor.execute("UPDATE foods SET name = %s, servingSize = %s, calories = %s, protein = %s, fat = %s, carbs = %s WHERE id = %s", data)
        #remember to commit after command
        self.connection.commit()

    def deleteFood(self, id):
        # needs id
        # gives nothing(only side effect)
        data = [id]
        self.cursor.execute("DELETE FROM foods WHERE id = %s", data)
        self.connection.commit()

    def createUser(self, first, last, email, encrypted_pass):
        data = [first, last, email, encrypted_pass]
        self.cursor.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (%s, %s, %s, %s)", data)
        self.connection.commit()

    def findUserByEmail(self, email):
        data = [email]
        self.cursor.execute("SELECT * FROM users WHERE email = %s", data)
        return self.cursor.fetchone()

    def createDay(self):
        data = [0, 0, 0, 0]
        self.cursor.execute("INSERT INTO days (calories, protein, fat, carbs) VALUES (%s, %s, %s, %s)", data)
        self.connection.commit()

    def updateDay(self, calories, protein, fats, carbs, id):
        data = [str(calories), str(protein), str(fats), str(carbs), str(id)]
        self.cursor.execute("UPDATE days SET calories = %s, protein = %s, fat = %s, carbs = %s WHERE id = %s", data)
        self.connection.commit()
    
    def getDay(self, dayID):
        data = [int(dayID)]
        self.cursor.execute("SELECT * FROM days WHERE id = %s", data)
        return self.cursor.fetchone()
    
    def getAllDays(self):
        self.cursor.execute("SELECT * FROM days")
        return self.cursor.fetchall()