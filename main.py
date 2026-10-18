# Python MongoDB tutorial — every pymongo example from the slides, in one file.
# Run:  .venv/bin/python main.py   (needs MongoDB on localhost:27017)

from pymongo import MongoClient

# Every database the slides use. They are dropped at the start so the
# whole script can be run again and again without DuplicateKeyError.
TUTORIAL_DBS = ["mydb", "mydatabase", "myDB", "sdsegf", "ghhj", "b_mydb",
                "lpaksgf", "sampleDB", "example2", "l"]


def banner(title):
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


def reset():
    client = MongoClient('localhost', 27017)
    for name in TUTORIAL_DBS:
        client.drop_database(name)


# 1. Introduction (page 1)
def ch01_introduction():
    banner("1. Python MongoDB — Introduction")
    import pymongo
    print("pymongo version:", pymongo.version)


# 2. Create Database (pages 2-3)
def ch02_create_database():
    banner("2. Python MongoDB — Create Database")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['mydb']

    print("Database created........")

    #Verification
    # Note: MongoDB creates a database lazily, so 'mydb' only shows up
    # here once something has been written into it.
    print("List of databases after creating new one")
    print(client.list_database_names())


# 3. Create Collection (pages 4-5)
def ch03_create_collection():
    banner("3. Python MongoDB — Create Collection")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['mydb']

    #Creating a collection
    collection = db['example']

    print("Collection created........")


# 4. Insert Document (pages 7-9)
def ch04_insert_one():
    banner("4. Python MongoDB — Insert Document (insert_one)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['mydb']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    doc1 = {"name": "Ram", "age": "26", "city": "Hyderabad"}
    coll.insert_one(doc1)

    print(coll.find_one())


def ch04_insert_many():
    banner("4. Python MongoDB — Insert Document (insert_many)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['mydb']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "101", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "102", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "103", "name": "Robert", "age": "28", "city": "Mumbai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")
    print(res.inserted_ids)


# 5. Find (pages 11-13)
def ch05_find_one():
    banner("5. Python MongoDB — Find (find_one)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['mydatabase']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "101", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "102", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "103", "name": "Robert", "age": "28", "city": "Mumbai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")
    print(res.inserted_ids)

    #Retrieving the first record using the find_one() method
    print("First record of the collection: ")
    print(coll.find_one())

    #Retrieving a record with is 103 using the find_one() method
    print("Record whose id is 103: ")
    print(coll.find_one({"_id": "103"}))


def ch05_find():
    banner("5. Python MongoDB — Find (find)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    # MongoDB does not allow two databases whose names differ only in case,
    # so 'mydb' (chapters 2-4) must be removed before 'myDB' can be created.
    client.drop_database('mydb')

    #Getting the database instance
    db = client['myDB']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "101", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "102", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "103", "name": "Robert", "age": "28", "city": "Mumbai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Retrieving all the records using the find() method
    print("Records of the collection: ")
    for doc1 in coll.find():
        print(doc1)

    #Retrieving records with age greater than 26 using the find() method
    print("Record whose age is more than 26: ")
    for doc2 in coll.find({"age": {"$gt": "26"}}):
        print(doc2)


# 6. Query (pages 14-16)
def ch06_query_equal():
    banner("6. Python MongoDB — Query (Example1: name is Sarmista)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['sdsegf']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "1001", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "1002", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "1003", "name": "Robert", "age": "28", "city": "Mumbai"},
            {"_id": "1004", "name": "Romeo", "age": "25", "city": "Pune"},
            {"_id": "1005", "name": "Sarmista", "age": "23", "city": "Delhi"},
            {"_id": "1006", "name": "Rasajna", "age": "26", "city": "Chennai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Retrieving data
    print("Documents in the collection: ")
    for doc1 in coll.find({"name": "Sarmista"}):
        print(doc1)


def ch06_query_gt():
    banner("6. Python MongoDB — Query (Example2: age greater than 26)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['ghhj']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "1001", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "1002", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "1003", "name": "Robert", "age": "28", "city": "Mumbai"},
            {"_id": "1004", "name": "Romeo", "age": "25", "city": "Pune"},
            {"_id": "1005", "name": "Sarmista", "age": "23", "city": "Delhi"},
            {"_id": "1006", "name": "Rasajna", "age": "26", "city": "Chennai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Retrieving data
    print("Documents in the collection: ")
    for doc in coll.find({"age": {"$gt": "26"}}):
        print(doc)


# 7. Sort (pages 17-19)
def ch07_sort():
    banner("7. Python MongoDB — Sort")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['b_mydb']

    #Creating a collection
    coll = db['myColl']

    #Inserting document into a collection
    # (ages are a mix of numbers and strings, exactly as in the slides)
    data = [{"_id": "1001", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "1002", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "1003", "name": "Robert", "age": "28", "city": "Mumbai"},
            {"_id": "1004", "name": "Romeo", "age": 25, "city": "Pune"},
            {"_id": "1005", "name": "Sarmista", "age": 23, "city": "Delhi"},
            {"_id": "1006", "name": "Rasajna", "age": 26, "city": "Chennai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Retrieving the documents sorted by age using the find() and sort() methods
    print("List of documents (sorted in ascending order based on age): ")
    for doc1 in coll.find().sort("age"):
        print(doc1)


# 8. Delete Document (pages 20-24)
def ch08_delete_one():
    banner("8. Python MongoDB — Delete Document (delete_one)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)
    #Getting the database instance
    db = client['lpaksgf']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "1001", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "1002", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "1003", "name": "Robert", "age": "28", "city": "Mumbai"},
            {"_id": "1004", "name": "Romeo", "age": 25, "city": "Pune"},
            {"_id": "1005", "name": "Sarmista", "age": 23, "city": "Delhi"},
            {"_id": "1006", "name": "Rasajna", "age": 26, "city": "Chennai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")
    #Deleting one document
    coll.delete_one({"_id": "1006"})

    #Retrieving all the records using the find() method
    print("Documents in the collection after update operation: ")
    for doc2 in coll.find():
        print(doc2)


def ch08_delete_many():
    banner("8. Python MongoDB — Delete Document (delete_many)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['sampleDB']

    #Creating a collection
    coll = db['example']

    #Inserting document into a collection
    data = [{"_id": "1001", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "1002", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "1003", "name": "Robert", "age": "28", "city": "Mumbai"},
            {"_id": "1004", "name": "Romeo", "age": "25", "city": "Pune"},
            {"_id": "1005", "name": "Sarmista", "age": "23", "city": "Delhi"},
            {"_id": "1006", "name": "Rasajna", "age": "26", "city": "Chennai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Deleting multiple documents
    coll.delete_many({"age": {"$gt": "26"}})

    #Retrieving all the records using the find() method
    print("Documents in the collection after update operation: ")
    for doc2 in coll.find():
        print(doc2)

    #Deleting all the documents (delete_many without a query)
    coll.delete_many({})
    print("Documents left after delete_many({}):", coll.count_documents({}))


# 9. Drop Collection (pages 25-26)
def ch09_drop_collection():
    banner("9. Python MongoDB — Drop Collection")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['example2']

    #Creating a collection
    col1 = db['collection']
    col1.insert_one({"name": "Ram", "age": "26", "city": "Hyderabad"})
    col2 = db['coll']
    col2.insert_one({"name": "Rahim", "age": "27", "city": "Bangalore"})
    col3 = db['myColl']
    col3.insert_one({"name": "Robert", "age": "28", "city": "Mumbai"})
    col4 = db['data']
    col4.insert_one({"name": "Romeo", "age": "25", "city": "Pune"})

    #List of collections
    print("List of collections:")
    collections = db.list_collection_names()
    for coll in collections:
        print(coll)

    #Dropping a collection
    col1.drop()
    col4.drop()

    print("List of collections after dropping two of them: ")

    #List of collections
    collections = db.list_collection_names()
    for coll in collections:
        print(coll)


# 10. Update (pages 27-31)
def ch10_update_one():
    banner("10. Python MongoDB — Update (update_one)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['myDB']

    #Creating a collection
    coll = db['example']
    coll.drop()  # myDB.example was already filled in chapter 5

    #Inserting document into a collection
    data = [{"_id": "101", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "102", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "103", "name": "Robert", "age": "28", "city": "Mumbai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Retrieving all the records using the find() method
    print("Documents in the collection: ")
    for doc1 in coll.find():
        print(doc1)

    coll.update_one({"_id": "102"}, {"$set": {"city": "Visakhapatnam"}})

    #Retrieving all the records using the find() method
    print("Documents in the collection after update operation: ")
    for doc2 in coll.find():
        print(doc2)


def ch10_update_many():
    banner("10. Python MongoDB — Update (update_many)")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['myDB']

    #Creating a collection
    coll = db['example']
    coll.drop()  # start from the same 3 documents as the slide

    #Inserting document into a collection
    data = [{"_id": "101", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "102", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "103", "name": "Robert", "age": "28", "city": "Mumbai"}]

    res = coll.insert_many(data)
    print("Data inserted ......")

    #Retrieving all the records using the find() method
    print("Documents in the collection: ")
    for doc1 in coll.find():
        print(doc1)

    coll.update_many({}, {"$set": {"city": "Visakhapatnam"}})

    #Retrieving all the records using the find() method
    print("Documents in the collection after update operation: ")
    for doc2 in coll.find():
        print(doc2)


# 11. Limit (pages 32-34)
def ch11_limit():
    banner("11. Python MongoDB — Limit")

    #Creating a pymongo client
    client = MongoClient('localhost', 27017)

    #Getting the database instance
    db = client['l']

    #Creating a collection
    coll = db['myColl']

    #Inserting document into a collection
    data = [{"_id": "1001", "name": "Ram", "age": "26", "city": "Hyderabad"},
            {"_id": "1002", "name": "Rahim", "age": "27", "city": "Bangalore"},
            {"_id": "1003", "name": "Robert", "age": "28", "city": "Mumbai"},
            {"_id": "1004", "name": "Romeo", "age": 25, "city": "Pune"},
            {"_id": "1005", "name": "Sarmista", "age": 23, "city": "Delhi"},
            {"_id": "1006", "name": "Rasajna", "age": 26, "city": "Chennai"}]
    res = coll.insert_many(data)
    print("Data inserted ......")
    #Retrieving first 3 documents using the find() and limit() methods
    print("First 3 documents in the collection: ")
    for doc1 in coll.find().limit(3):
        print(doc1)


if __name__ == "__main__":
    reset()
    ch01_introduction()
    ch02_create_database()
    ch03_create_collection()
    ch04_insert_one()
    ch04_insert_many()
    ch05_find_one()
    ch05_find()
    ch06_query_equal()
    ch06_query_gt()
    ch07_sort()
    ch08_delete_one()
    ch08_delete_many()
    ch09_drop_collection()
    ch10_update_one()
    ch10_update_many()
    ch11_limit()
    print("\nAll examples finished.")
