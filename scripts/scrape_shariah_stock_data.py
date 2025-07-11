import requests
from bs4 import BeautifulSoup
from bs4.element import ResultSet, Tag
import time
import csv
import os
import concurrent.futures
import json
from typing import Any

def get_all_stock_links():
    all_stock_links = []
    page = 1
    while True:
        url = f"https://zoya.finance/stocks?d3bb03e2_page={page}"
        print(f"Scraping stock links from page {page}: {url}")
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        if "No items found." in soup.text:
            print("Reached end of stock list. Stopping link scraping.")
            break

        stock_tags: ResultSet[Any] = soup.find_all('a', attrs={'class': 'w-inline-block'})
        
        stock_elements = []
        for s in stock_tags:
            if not isinstance(s, Tag):
                continue

            href = s.get('href')
            if isinstance(href, str) and href.startswith('/stocks/') and s.find('div', attrs={'class': 'dark-50-text normal-weight'}):
                stock_elements.append(s)

        if not stock_elements:
            print("No more stock elements found on this page. Stopping link scraping.")
            break

        for stock_element in stock_elements:
            ticker_div = stock_element.find('div', attrs={'class': 'dark-50-text normal-weight'})
            ticker = ticker_div.text.strip() if ticker_div else 'N/A'
            
            company_name = 'N/A'
            if ticker_div:
                company_name_div = ticker_div.find_next_sibling('div')
                if company_name_div:
                    company_name = company_name_div.text.strip()

            link_suffix = stock_element.get('href', '')
            full_link = f"https://zoya.finance{link_suffix}"
            
            all_stock_links.append({'ticker': ticker, 'company_name': company_name, 'link': full_link})
        
        page += 1
        time.sleep(0.5)

    return all_stock_links

def get_shariah_compliance(stock_link):
    try:
        response = requests.get(stock_link)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        if "not Shariah-compliant" in soup.text:
            return False
        elif "is Shariah-compliant" in soup.text:
            return True
        else:
            return "Status not found"
    except Exception as e:
        print(f"Error getting compliance for {stock_link}: {e}")
        return "Error"

def convert_to_json(data, json_file_path):
    # Ensure the directory exists
    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4)
    print(f"Successfully converted data to {json_file_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    output_dir = os.path.join(project_root, "output")
    assets_dir = os.path.join(project_root, "src", "assets")
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)

    print("Starting to scrape all stock links...")
    stock_data = get_all_stock_links()
    
    # Temporarily limiting to 10 stocks for testing
    stock_data = stock_data[:10]

    print(f"Found {len(stock_data)} stock links. Now retrieving compliance status for all {len(stock_data)} stocks concurrently...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_stock = {executor.submit(get_shariah_compliance, stock['link']): stock for stock in stock_data}

        for i, future in enumerate(concurrent.futures.as_completed(future_to_stock)):
            stock = future_to_stock[future]
            try:
                compliance_status = future.result()
                stock['compliance'] = compliance_status
                print(f"Processed stock {i + 1}/{len(stock_data)}: {stock['ticker']} - Status: {compliance_status}")
            except Exception as exc:
                stock['compliance'] = 'Error'
                print(f"Error for {stock['ticker']}: {exc}")

    # Save to CSV
    csv_filename = os.path.join(assets_dir, "shariah_stock_list.csv")
    with open(csv_filename, mode='w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["ticker", "company_name", "compliance", "link"])
        for stock in stock_data:
            writer.writerow([stock['ticker'], stock['company_name'], str(stock['compliance']), stock['link']])
    print(f"CSV file saved to {csv_filename}")

    # Convert to JSON for the frontend
    json_filename = os.path.join(assets_dir, "shariah_stock_data.json")
    convert_to_json(stock_data, json_filename)
