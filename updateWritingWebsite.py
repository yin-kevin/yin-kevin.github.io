#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Feb  2 17:16:16 2025

@author: kevinyin
"""

import requests
import json
import os
import shutil

from bs4 import BeautifulSoup
from dateutil.parser import parse
from datetime import datetime


# Constants
AUTHOR_PAGE_URL = "https://www.theglobeandmail.com/authors/kevin-yin"  # Modify with actual URL
WRITING_HTML_PATH = "/Users/kevinyin/Documents/Website/Public/writing.html"
TEMPLATE_PATH = "/Users/kevinyin/Documents/Website/Public/writing_template.html"
ARTICLES_JSON = "/Users/kevinyin/Documents/Website/Public/assets/json/articles.json"
NOTGLOBE_JSON = "/Users/kevinyin/Documents/Website/Public/assets/json/notglobe.json"


# retrieve specifically the image data from the article page
def scrape_article_image(article_url):
    """Scrapes the larger image from the full article page."""
    try:
        # Fetch the article page
        response = requests.get(article_url)
        if response.status_code != 200:
            print(f"Failed to fetch article page: {article_url}")
            return "default.jpg"

        # Parse the page HTML
        soup = BeautifulSoup(response.text, "html.parser")

        # Step 1: Locate the <figure> tag that contains the larger image
        figure_tag = soup.find("figure", {"class": lambda x: x and "BodyImage" in x})
        if figure_tag:
            # Step 2: Find the <img> tag within the <figure> tag
            img_tag = figure_tag.select_one("img.c-image")
            if img_tag and "src" in img_tag.attrs:
                #print(f"Larger Image URL: {img_tag['src']}")
                return img_tag["src"]


        # Step 3: Fallback to a broader selector if the above fails
        img_tag = soup.select_one("img.c-image")
        if img_tag and "src" in img_tag.attrs:
            print(f"Fallback Image URL: {img_tag['src']}")
            return img_tag["src"]

        # No image found
        print(f"No image found for article: {article_url}")
        return "default.jpg"

    except Exception as e:
        print(f"Error scraping article image: {e}")
        return "default.jpg"
    

# identify the articles from the author page
def fetch_articles():
    """Scrapes all articles by the author, handling pagination."""
    articles = []
    current_page_url = AUTHOR_PAGE_URL

    while current_page_url:
        print(f"Fetching articles from: {current_page_url}")
        response = requests.get(current_page_url)
        if response.status_code != 200:
            print(f"Failed to fetch page: {current_page_url}")
            break

        soup = BeautifulSoup(response.text, "html.parser")

        # Scrape articles on the current page
        for card in soup.select("article.tgam-card-with-date"):
            # Title and URL are inside the headline link
            title_link = card.select_one("h2.tgam-card-headline a.tgam-card-headline__link")
            # Date is in the <time> element with this class
            date_tag = card.select_one("time.tgam-card-with-date__date")

            if not (title_link and date_tag):
                continue

            title_text = title_link.get_text(strip=True)
            article_url = title_link.get("href", "").strip()

            # Make URL absolute if it starts with "/"
            if article_url.startswith("/"):
                article_url = f"https://www.theglobeandmail.com{article_url}"

            date_text = date_tag.get_text(strip=True)
            try:
                date_parsed = parse(date_text)
            except Exception:
                date_parsed = None

            # Scrape the image from the article page
            image_url = scrape_article_image(article_url)

            article_data = {
                "title": title_text,
                "url": article_url,
                "date": date_text,
                "img_src": image_url,
                "date_parsed": date_parsed.isoformat() if date_parsed else None,  # For sorting
            }
            articles.append(article_data)

        # Find the "Next" button/link for pagination
        next_button = soup.select_one("a[aria-label='Next Page']")
        if next_button and "href" in next_button.attrs:
            next_page_url = next_button["href"]
            if next_page_url.startswith("/"):
                current_page_url = f"https://www.theglobeandmail.com{next_page_url}"
            else:
                current_page_url = next_page_url
        else:
            # No more pages
            current_page_url = None

    # Sort articles by date
    articles = sorted(articles, key=lambda x: x["date_parsed"] or "", reverse=False)
    print(f"Found {len(articles)} articles.")
    return articles




def load_existing_articles():
    """Loads the existing articles from a JSON file."""
    if os.path.exists(ARTICLES_JSON):
        with open(ARTICLES_JSON, "r") as f:
            return json.load(f)
    return []




# save the list of articles into a JSON file, stored in the website folder
def save_articles(articles):
    """Saves the updated articles list."""
    with open(ARTICLES_JSON, "w") as f:
        json.dump(articles, f, indent=4)




def load_notglobe_articles(filepath=NOTGLOBE_JSON):
    with open(filepath, "r") as f:
        data = json.load(f)
    for article in data:
        # Parse date from string to datetime.date
        article["date"] = datetime.strptime(article["date"], "%Y-%m-%d").date()
    return data





# create/update the writing page using the new editorial layout
def update_writing_html(new_articles):
    """Updates writing.html to list External and Column pieces in the new card layout."""

    # Load Globe articles from JSON
    if not os.path.exists(ARTICLES_JSON):
        print(f"Articles JSON file not found: {ARTICLES_JSON}")
        return

    with open(ARTICLES_JSON, "r") as f:
        articles = json.load(f)

    # Normalize dates for Globe articles to "Mon DD, YYYY"
    for article in articles:
        if article.get("date"):
            try:
                parsed_date = datetime.strptime(article["date"], "%B %d, %Y")
                article["date"] = parsed_date.strftime("%b %d, %Y")
            except ValueError:
                # Date may already be abbreviated or in a different format; leave as-is
                pass

    # Load current writing.html (we no longer copy from a template)
    with open(WRITING_HTML_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")

    # Helper to find the editorial list div by section heading text
    def find_editorial_list(heading_text: str):
        heading = soup.find("div", class_="editorial-heading")
        while heading:
            h2 = heading.find("h2")
            if h2 and h2.get_text(strip=True) == heading_text:
                container = heading.find_next_sibling("div", class_="editorial-list")
                return container
            heading = heading.find_next("div", class_="editorial-heading")
        return None

    # Helper to build a single editorial card
    def build_editorial_item(article, publication_label: str):
        item = soup.new_tag("article", **{"class": "editorial-item"})

        thumb_link = soup.new_tag("a", href=article["url"], **{"class": "editorial-thumb"})
        img = soup.new_tag("img", src=article["img_src"], alt="")
        thumb_link.append(img)

        copy_div = soup.new_tag("div", **{"class": "editorial-copy"})
        h3 = soup.new_tag("h3")
        a = soup.new_tag("a", href=article["url"])
        a.string = article["title"]
        h3.append(a)

        p = soup.new_tag("p")
        date_text = article.get("date", "")
        p.string = f"Published in {publication_label}, {date_text}."

        copy_div.append(h3)
        copy_div.append(p)

        item.append(thumb_link)
        item.append(copy_div)
        return item

    # NOTE: We intentionally do NOT touch the "External" section here.
    # That section is maintained manually in writing.html (e.g., FT + Foreign Policy),
    # and this script should only regenerate the "Column" list from articles.json.

    # Update Column section from Globe articles
    column_list = find_editorial_list("Column")
    if not column_list:
        print("Error: Could not find 'Column' editorial list in writing.html.")
    else:
        column_list.clear()
        sorted_globe = sorted(
            articles,
            key=lambda x: x.get("date_parsed") or "",
            reverse=True,
        )
        for article in sorted_globe:
            column_list.append(build_editorial_item(article, "The Globe and Mail"))

    # Overwrite writing.html with updated content
    with open(WRITING_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(soup.prettify())

    print("Writing HTML updated with new editorial layout.")



# run the whole thing
def main():
    new_articles = fetch_articles()
    save_articles(new_articles)
    update_writing_html(new_articles)

if __name__ == "__main__":
    main()
