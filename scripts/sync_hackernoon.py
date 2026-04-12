import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime

import html2text
import requests

RSS_URL = "https://hackernoon.com/u/krishnaduttpanchagnula/feed"
BLOG_DIR = "blog"


def slugify(text):
    return re.sub(r"[^\w\s-]", "", text).strip().lower().replace(" ", "-")


def fetch_blogs():
    print(f"Fetching blogs from RSS: {RSS_URL}...")
    response = requests.get(RSS_URL, headers={"User-Agent": "Mozilla/5.0"})
    if response.status_code != 200:
        print(f"Failed to fetch RSS feed: {response.status_code}")
        return

    root = ET.fromstring(response.text)
    items = root.findall(".//item")

    h = html2text.HTML2Text()
    h.ignore_links = False

    for item in items:
        title = item.find("title").text.strip()
        link = item.find("link").text.strip()
        pub_date_str = item.find("pubDate").text.strip()

        # Parse date to YYYY-MM-DD
        # Example pubDate: Tue, 07 Apr 2026 11:52:49 GMT
        try:
            pub_date = datetime.strptime(pub_date_str, "%a, %d %b %Y %H:%M:%S %Z")
        except ValueError:
            pub_date = datetime.now()

        date_prefix = pub_date.strftime("%Y-%m-%d")
        slug = slugify(title)
        filename = f"{date_prefix}-{slug}.md"
        filepath = os.path.join(BLOG_DIR, filename)

        if os.path.exists(filepath):
            print(f"Skipping existing blog: {title}")
            continue

        print(f"Found new blog: {title}. Fetching content...")
        try:
            art_res = requests.get(link, headers={"User-Agent": "Mozilla/5.0"})
            # Note: RSS content might be truncated. Fetching the full page for content.
            # HackerNoon content is usually within a specific structure.
            # Since full page fetch for SPA might be hard, we'll try to extract what's in the RSS first
            # but if RSS is full, that's better.

            description = (
                item.find("description").text
                if item.find("description") is not None
                else ""
            )
            # If description is just a summary, we might need a better way.
            # But RSS usually has a good portion.

            content = h.handle(description)

            with open(filepath, "w") as f:
                f.write(
                    f'---\ntitle: "{title}"\nslug: {slug}\ndate: {pub_date.isoformat()}\n---\n\n{content}\n\n*Originally published at [HackerNoon]({link})*'
                )
        except Exception as e:
            print(f"Failed to process {link}: {e}")


if __name__ == "__main__":
    if not os.path.exists(BLOG_DIR):
        os.makedirs(BLOG_DIR)
    fetch_blogs()
