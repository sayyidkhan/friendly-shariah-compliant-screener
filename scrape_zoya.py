
import requests
from bs4 import BeautifulSoup
import time

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

        stock_elements = soup.find_all('a', class_='w-inline-block')
        stock_elements = [s for s in stock_elements if s.get('href', '').startswith('/stocks/') and s.find('div', class_='dark-50-text normal-weight')]

        if not stock_elements:
            print("No more stock elements found on this page. Stopping link scraping.")
            break

        for stock_element in stock_elements:
            ticker_div = stock_element.find('div', class_='dark-50-text normal-weight')
            ticker = ticker_div.text.strip() if ticker_div else 'N/A'
            
            company_name_div = stock_element.find('div', class_=lambda x: x != 'dark-50-text normal-weight' and x is not None)
            company_name = company_name_div.text.strip() if company_name_div else 'N/A'

            link_suffix = stock_element['href']
            full_link = f"https://zoya.finance{link_suffix}"
            
            all_stock_links.append({'ticker': ticker, 'company_name': company_name, 'link': full_link})
        
        page += 1
        time.sleep(0.5) # Small delay to be polite to the server

    return all_stock_links

def get_shariah_compliance(stock_link):
    try:
        response = requests.get(stock_link)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        if "not Shariah-compliant" in soup.text:
            return "Not Shariah-compliant"
        elif "is Shariah-compliant" in soup.text:
            return "Shariah-compliant"
        else:
            return "Status not found"
    except Exception as e:
        print(f"Error getting compliance for {stock_link}: {e}")
        return "Error"

if __name__ == "__main__":
    print("Starting to scrape all stock links...")
    stock_data = get_all_stock_links()
    
    # Limit to the first 100 stocks for partial list
    stock_data_partial = stock_data[:100]

    print(f"Found {len(stock_data)} stock links. Now retrieving compliance status for the first {len(stock_data_partial)} stocks...")

    for i, stock in enumerate(stock_data_partial):
        print(f"Processing stock {i+1}/{len(stock_data_partial)}: {stock['ticker']}")
        stock['compliance'] = get_shariah_compliance(stock['link'])
        time.sleep(0.1) # Small delay between compliance checks

    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shariah-Compliant Stock List</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
        h1 { color: #0056b3; }
        #searchInput { 
            width: 100%; 
            padding: 10px; 
            margin-bottom: 20px; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
            box-sizing: border-box; 
            font-size: 16px; 
        }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        th, td { padding: 12px 15px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #0056b3; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        a { color: #0056b3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .compliant { color: green; font-weight: bold; }
        .not-compliant { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Shariah-Compliant Stock List (Partial)</h1>
    <input type="text" id="searchInput" onkeyup="searchTable()" placeholder="Search for ticker symbols or company names...">
    <table id="stockTable">
        <thead>
            <tr>
                <th>Ticker Symbol</th>
                <th>Company Name</th>
                <th>Shariah Compliant</th>
                <th>Link</th>
            </tr>
        </thead>
        <tbody>
    """

    for stock in stock_data_partial:
        compliance_class = "compliant" if stock['compliance'] == "Shariah-compliant" else "not-compliant"
        html_content += f"""
            <tr>
                <td>{stock['ticker']}</td>
                <td>{stock['company_name']}</td>
                <td class="{compliance_class}">{stock['compliance']}</td>
                <td><a href="{stock['link']}" target="_blank">{stock['link']}</a></td>
            </tr>
        """

    html_content += """
        </tbody>
    </table>

    <script>
        function searchTable() {
            var input, filter, table, tr, td, i, txtValue1, txtValue2;
            input = document.getElementById("searchInput");
            filter = input.value.toUpperCase();
            table = document.getElementById("stockTable");
            tr = table.getElementsByTagName("tr");

            for (i = 1; i < tr.length; i++) { // Start from 1 to skip the header row
                td1 = tr[i].getElementsByTagName("td")[0]; // Ticker Symbol column
                td2 = tr[i].getElementsByTagName("td")[1]; // Company Name column
                if (td1 || td2) {
                    txtValue1 = td1.textContent || td1.innerText;
                    txtValue2 = td2.textContent || td2.innerText;
                    if (txtValue1.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    </script>
</body>
</html>
    """

    with open("zoya_stock_list.html", "w") as f:
        f.write(html_content)
    print(f"Scraped {len(stock_data_partial)} stocks with compliance status. Data saved to zoya_stock_list.html")


