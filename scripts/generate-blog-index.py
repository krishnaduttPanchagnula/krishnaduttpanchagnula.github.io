import json
import os
import re
from datetime import datetime

BLOG_DIR = "blog"
OUTPUT_FILE = "src/data/latest-posts.json"


def get_latest_posts():
    posts = []
    for f in os.listdir(BLOG_DIR):
        if f.endswith(".md"):
            # Extract date and slug from filename: YYYY-MM-DD-slug.md
            match = re.match(r"(\d{4}-\d{2}-\d{2})-(.*)\.md", f)
            if match:
                date_str, slug = match.groups()
                path = os.path.join(BLOG_DIR, f)

                # Try to get title from frontmatter
                title = slug.replace("-", " ").title()
                with open(path, "r") as file:
                    content = file.read()
                    title_match = re.search(r'title:\s*"(.*?)"', content)
                    if title_match:
                        title = title_match.group(1)

                posts.append(
                    {
                        "title": title,
                        "date": date_str,
                        "slug": slug,
                        "timestamp": datetime.strptime(
                            date_str, "%Y-%m-%d"
                        ).timestamp(),
                    }
                )

    # Sort by timestamp descending
    posts.sort(key=lambda x: x["timestamp"], reverse=True)
    return posts[:3]


if __name__ == "__main__":
    if not os.path.exists("src/data"):
        os.makedirs("src/data")

    latest = get_latest_posts()
    with open(OUTPUT_FILE, "w") as f:
        json.dump(latest, f, indent=2)
    print(f"Generated index with {len(latest)} posts.")
