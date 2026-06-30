from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# ==============================
# Home Page
# ==============================
@app.route("/")
def home():
    return render_template("index.html")


# ==============================
# Analyze GitHub Profile
# ==============================
@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    if not data or "username" not in data:
        return jsonify({"error": "Username is required"}), 400

    username = data["username"].strip()

    if username == "":
        return jsonify({"error": "Username cannot be empty"}), 400

    # ------------------------------
    # GitHub API URLs
    # ------------------------------
    user_url = f"https://api.github.com/users/{username}"
    repo_url = f"https://api.github.com/users/{username}/repos?per_page=100"

    # ------------------------------
    # Get User Details
    # ------------------------------
    user_response = requests.get(user_url)

    if user_response.status_code != 200:
        return jsonify({"error": "GitHub user not found"}), 404

    user = user_response.json()

    # ------------------------------
    # Get Repository Details
    # ------------------------------
    repo_response = requests.get(repo_url)

    if repo_response.status_code != 200:
        return jsonify({"error": "Unable to fetch repositories"}), 500

    repos = repo_response.json()

    # ------------------------------
    # Calculate Statistics
    # ------------------------------
    total_stars = 0
    total_forks = 0
    languages = {}

    for repo in repos:

        # Total Stars
        total_stars += repo.get("stargazers_count", 0)

        # Total Forks
        total_forks += repo.get("forks_count", 0)

        # Languages
        language = repo.get("language")

        if language:
            languages[language] = languages.get(language, 0) + 1

    # ------------------------------
    # Response
    # ------------------------------
    result = {

        "username": user.get("login"),

        "name": user.get("name") or user.get("login"),

        "avatar": user.get("avatar_url"),

        "bio": user.get("bio"),

        "company": user.get("company"),

        "location": user.get("location"),

        "followers": user.get("followers"),

        "following": user.get("following"),

        "public_repos": user.get("public_repos"),

        "created_at": user.get("created_at"),

        "profile_url": user.get("html_url"),

        "stars": total_stars,

        "forks": total_forks,

        "languages": languages
    }

    return jsonify(result)


# ==============================
# Run Flask
# ==============================
if __name__ == "__main__":
    app.run(debug=True)