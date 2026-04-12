import os
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime

USER_URL = "https://hackernoon.com/u/krishnaduttpanchagnula"
BLOG_DIR = "blog"

def slugify(text):
    return re.sub(r'[^\w\s-]', '', text).strip().lower().replace(' ', '-')

def fetch_blogs():
    print(f"Fetching blogs from {USER_URL}...")
    response = requests.get(USER_URL, headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(response.text, 'html.parser')

    # HackerNoon usually stores articles in <h3> or <a> tags within a specific container
    articles = soup.find_all('h3')

    for article in articles:
        link_tag = article.find('a') if article.name != 'a' else article
        if not link_tag or 'href' not in link_tag.attrs:
            continue

        title = link_tag.text.strip()
        url = "https://hackernoon.com" + link_tag['href']

        # Avoid duplicates or non-article links
        if "/u/" in url or not title:
            continue

        slug = slugify(title)
        filename = f"{datetime.now().strftime('%Y-%m-%d')}-{slug}.md"
        filepath = os.path.join(BLOG_DIR, filename)

        if os.path.exists(filepath):
            print(f"Skipping existing blog: {title}")
            continue

        print(f"Found new blog: {title}. Fetching content...")
        try:
            art_res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            art_soup = BeautifulSoup(art_res.text, 'html.parser')

            # Simple extraction - HackerNoon content is usually in a specific div
            content_div = art_soup.find('div', {'class': 'paragraph'}) or art_soup.find('article')
            content = content_div.text if content_div else "Content could not be fetched automatically."

            with open(filepath, 'w') as f:
                f.write(f"---\ntitle: \"{title}\"\nslug: {slug}\n---\n\n{content}\n\n*Originally published at [HackerNoon]({url})*")
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")

if __name__ == "__main__":
    if not os.path.exists(BLOG_DIR):
        os.makedirs(BLOG_DIR)
    fetch_blogs()
