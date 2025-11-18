from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app) 

@app.route('/save_password', methods=['POST'])
def save_password():
    password = request.json.get('password')
    if not password:
        return jsonify({"error": "No password received"}), 400

    try:
        with open("top-1000.txt", "r") as common_file:
            common_passwords = set(p.strip() for p in common_file.readlines())
    except FileNotFoundError:
        return jsonify({"error": "Password list file not found"}), 500

    if password in common_passwords:
        return jsonify({"message": "❌ This password already exists in the common list."}), 200

    hashed = hashlib.sha256(password.encode()).hexdigest()

    with open("hashed_passwords.txt", "a") as f:
        f.write(f"Original: {password}\nSHA-256: {hashed}\n\n")

    return jsonify({"message": "✅ Password hashed and saved!"})

if __name__ == '__main__':
    app.run(debug=True)