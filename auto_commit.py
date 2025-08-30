import requests
import subprocess

# Get staged diff
diff = subprocess.run(["git", "diff", "--cached"], capture_output=True, text=True).stdout

if not diff.strip():
    print("No staged changes found.")
    exit(1)

# Call Spring Boot API
url = "http://localhost:8080/api/commit/generate"
payload = {
    "diffContent": diff,
    "style": "CONVENTIONAL",
    "numAlternatives": 2,
    "generatePr": False
}

resp = requests.post(url, json=payload)
if resp.status_code != 200:
    print("Error:", resp.text)
    exit(1)

commit_message = resp.json()["commitMessage"]

# Run git commit automatically with the generated message
subprocess.run(["git", "commit", "-m", commit_message])

print("✅ Commit done with AI-generated message:")
print(commit_message)

print()