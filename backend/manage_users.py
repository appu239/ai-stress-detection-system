"""
StressAI - User Management CLI
================================
Manage users in the JSON file-based user store.
Matches the user system in final_model.py (no MongoDB required).

Usage:
  cd backend
  python manage_users.py --list
  python manage_users.py --create-admin --email admin@stressai.com --password Admin@123 --name "Admin User"
  python manage_users.py --promote --email user@example.com
"""

import json
import os
import argparse

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    print("[WARN] bcrypt not available - passwords will be stored as plaintext")

USER_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.json")


def load_users():
    """Load users from JSON file."""
    if os.path.exists(USER_FILE):
        try:
            with open(USER_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_users(users):
    """Save users to JSON file."""
    with open(USER_FILE, "w") as f:
        json.dump(users, f, indent=2)


def hash_password(password):
    """Hash password with bcrypt if available."""
    if BCRYPT_AVAILABLE:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    return password


def create_user(name, email, password, role="USER"):
    """Create a new user in users.json."""
    users = load_users()

    # Check for duplicate email
    if any(u["email"] == email for u in users):
        print(f"[ERROR] User with email '{email}' already exists.")
        return

    users.append({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": role
    })

    save_users(users)
    print(f"[OK] User '{name}' created with role '{role}'.")


def promote_user(email, role="ADMIN"):
    """Promote an existing user to a new role."""
    users = load_users()

    user = next((u for u in users if u["email"] == email), None)
    if not user:
        print(f"[ERROR] User with email '{email}' not found.")
        return

    user["role"] = role
    save_users(users)
    print(f"[OK] User '{email}' promoted to '{role}'.")


def list_users():
    """List all registered users."""
    users = load_users()

    if not users:
        print("No users registered yet.")
        return

    print(f"\n{'Name':<20} {'Email':<30} {'Role':<10}")
    print("-" * 60)
    for user in users:
        name = user.get("name", "N/A")
        email = user.get("email", "N/A")
        role = user.get("role", "USER")
        print(f"{name:<20} {email:<30} {role:<10}")
    print(f"\nTotal: {len(users)} users")


def delete_user(email):
    """Delete a user by email."""
    users = load_users()
    original_count = len(users)
    users = [u for u in users if u["email"] != email]

    if len(users) == original_count:
        print(f"[ERROR] User with email '{email}' not found.")
        return

    save_users(users)
    print(f"[OK] User '{email}' deleted.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage users in StressAI")
    parser.add_argument("--create-admin", action="store_true", help="Create a new admin user")
    parser.add_argument("--create-user", action="store_true", help="Create a new regular user")
    parser.add_argument("--promote", action="store_true", help="Promote an existing user to ADMIN")
    parser.add_argument("--delete", action="store_true", help="Delete a user by email")
    parser.add_argument("--list", action="store_true", help="List all users")
    parser.add_argument("--email", type=str, help="Email of the user")
    parser.add_argument("--password", type=str, help="Password for the new user")
    parser.add_argument("--name", type=str, default="Admin User", help="Name of the new user")

    args = parser.parse_args()

    if args.list:
        list_users()
    elif args.create_admin:
        if not args.email or not args.password:
            print("Email and password are required. Use: --email EMAIL --password PASS")
        else:
            create_user(args.name, args.email, args.password, role="ADMIN")
    elif args.create_user:
        if not args.email or not args.password:
            print("Email and password are required. Use: --email EMAIL --password PASS")
        else:
            create_user(args.name, args.email, args.password, role="USER")
    elif args.promote:
        if not args.email:
            print("Email is required. Use: --email EMAIL")
        else:
            promote_user(args.email, role="ADMIN")
    elif args.delete:
        if not args.email:
            print("Email is required. Use: --email EMAIL")
        else:
            delete_user(args.email)
    else:
        parser.print_help()
