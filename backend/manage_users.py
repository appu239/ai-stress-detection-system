import pymongo
import bcrypt
import argparse

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["stressai"]
users_collection = db["users"]

def create_user(name, email, password, role="USER"):
    if users_collection.find_one({"email": email}):
        print(f"User with email {email} already exists.")
        return

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw,
        "role": role
    })
    print(f"User {name} created with role {role}.")

def promote_user(email, role="ADMIN"):
    user = users_collection.find_one({"email": email})
    if not user:
        print(f"User with email {email} not found.")
        return

    users_collection.update_one({"email": email}, {"$set": {"role": role}})
    print(f"User {email} promoted to {role}.")

def list_users():
    users = users_collection.find()
    print(f"{'Name':<20} {'Email':<30} {'Role':<10}")
    print("-" * 60)
    for user in users:
        print(f"{user.get('name', 'N/A'):<20} {user.get('email', 'N/A'):<30} {user.get('role', 'USER'):<10}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage users in StressAI")
    parser.add_argument("--create-admin", action="store_true", help="Create a new admin user")
    parser.add_argument("--promote", action="store_true", help="Promote an existing user to ADMIN")
    parser.add_argument("--list", action="store_true", help="List all users")
    parser.add_argument("--email", type=str, help="Email of the user")
    parser.add_argument("--password", type=str, help="Password for the new user")
    parser.add_argument("--name", type=str, default="Admin User", help="Name of the new user")

    args = parser.parse_args()

    if args.list:
        list_users()
    elif args.create_admin:
        if not args.email or not args.password:
            print("Email and password are required to create an admin.")
        else:
            create_user(args.name, args.email, args.password, role="ADMIN")
    elif args.promote:
        if not args.email:
            print("Email is required to promote a user.")
        else:
            promote_user(args.email, role="ADMIN")
    else:
        parser.print_help()
