import csv
import json
import os
import requests
import pandas as pd
from typing import List, Dict, Any
from shariah_compliant_rule_engine import HalalStocksFilter

def get_sgx_companies() -> List[Dict[str, Any]]:
    """
    Fetches the list of all companies and their latest price data from the SGX API.
    """
    print("Fetching all company listings from SGX API...")
    
    # This URL fetches the stock code, name, last price, change, % change, and volume.
    url = "https://api.sgx.com/securities/v1.1?excludetypes=bonds&params=nc,cn,lt,c,p,vl"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    }
    try:
        req = requests.get(url, headers=headers)
        req.raise_for_status()
        data = req.json()['data']
        
        companies = data.get('prices', [])
        
        print(f"Successfully fetched {len(companies)} companies from SGX.")
        return companies
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from SGX API: {e}")
        return []

def main():
    """
    Main function to orchestrate the scraping and saving of SGX stock data.
    """
    print("Starting the SGX stock list fetch process...")
    
    companies = get_sgx_companies()
    if not companies:
        print("Could not retrieve company list. Exiting.")
        return

    # The filter script expects a dataframe with a 'Ticker' and 'Company Name' column
    df_sgx = pd.DataFrame(companies)
    df_sgx = df_sgx.rename(columns={'nc': 'Ticker', 'cn': 'Company Name'})

    # Append '.SI' to the ticker for compatibility with financial data websites
    df_sgx['Ticker'] = df_sgx['Ticker'].astype(str) + '.SI'

    # For testing, we'll run the filter on a small sample of 5 stocks.
    # To run on the full list, you can remove the next line.
    df_sgx_sample = df_sgx.head(5)
    print(f"Running compliance check on a sample of {len(df_sgx_sample)} stocks...")

    # --- RUN SHARIAH COMPLIANCE SCREENING ---
    print("Initializing the Shariah compliance screening process...")
    halal_filter = HalalStocksFilter()
    
    # This function will scrape financial data for each stock. This will take a long time for the full list.
    print("Fetching financial data for screening. This may take a while...")
    screened_data_df, screened_data_filename = halal_filter.get_screen_data(stocks=df_sgx_sample, verbose=1)

    print(f"Initial data scraping complete. Raw screening data saved to: {screened_data_filename}")

    # This function applies the rule engine to the scraped data.
    print("Applying Shariah compliance rules...")
    final_df, final_filename = halal_filter.apply_screen(df_or_filename=screened_data_df, output=2, length=2) # output=2 (all), length=2 (full)

    print(f"Screening complete. Final results saved to: {final_filename}")
    print("The results are saved in a new directory named with today's date.")

if __name__ == "__main__":
    main() 