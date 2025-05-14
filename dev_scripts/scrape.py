import requests
from bs4 import BeautifulSoup
import json
import time
import os

def parse_grammar_point(row):
    """Parse a single grammar point row from the table"""
    try:
        container = row.find('div', class_='container')
        meaning = container.contents[0].strip() if container and container.contents else ''
        
        return {
            'id': row.get('id', '').replace('row', ''),
            'order': row.get('data-order', ''),
            'romaji': row.get('data-romaji', ''),
            'name': row.find('a', class_='links').text if row.find('a', class_='links') else '',
            'level': row.find('th').get('class')[1] if row.find('th') else '',  # B, I, or A level
            'meaning': meaning,
            'equivalent': row.find('div', class_='equiv').text if row.find('div', class_='equiv') else '',
            'reference': row.find('td', class_='minimal').text if row.find('td', class_='minimal') else ''
        }
    except Exception as e:
        print(f"Warning: Could not parse row completely: {str(e)}")
        return None

def fetch_entry_details(entry_id, retries=3):
    """Fetch details page for a grammar point with retries"""
    url = f'https://core6000.neocities.org/dojg/entries/{entry_id}.html'
    for attempt in range(retries):
        try:
            response = requests.get(url)
            response.encoding = 'utf-8'  # Explicitly set response encoding
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser', from_encoding='utf-8')
                content = []

                # Get examples from dl/dt/dd structure
                examples = []
                dl = soup.find('dl')
                if dl:
                    # Process pairs of dd elements (Japanese and English)
                    dds = dl.find_all('dd')
                    for i in range(0, len(dds), 2):
                        if i + 1 < len(dds):
                            japanese_dd = dds[i]
                            # Find the highlighted grammar point
                            grammar_point = japanese_dd.find('span', class_='cloze')
                            grammar_point_text = grammar_point.get_text(strip=True) if grammar_point else None
                            # Get the full Japanese sentence
                            japanese_text = japanese_dd.get_text(strip=True)
                            
                            examples.append({
                                'japanese': japanese_text,
                                'english': dds[i + 1].get_text(strip=True).replace('In terms of ', ''),
                                'grammar_point': grammar_point_text,
                                'grammar_point_index': japanese_text.index(grammar_point_text) if grammar_point_text else None
                            })
                    if examples:
                        content.append(('examples', examples))
                    
                time.sleep(1)  # Rate limiting between successful requests
                return dict(content)
            
            time.sleep(0.333)  # Rate limiting between failed requests
                
        except Exception as e:
            print(f"Error processing entry {entry_id} on attempt {attempt + 1}: {str(e)}")
            if attempt < retries - 1:
                time.sleep(2)  # Longer wait between retries
    return None

def scrape_grammar_points(limit=10):
    """Scrape grammar points and their details"""
    # Read the main HTML file
    with open('https___core6000.neocities.org_dojg_.htm', 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # Find all grammar point rows
    rows = soup.find_all('tr', class_='rows')
    
    grammar_points = []
    skipped = 0
    for i, row in enumerate(rows):
        # if i >= limit:
        #     break
            
        point = parse_grammar_point(row)
        if point is None:
            skipped += 1
            continue
            
        print(f"Processing {point['id']}: {point['name']} ({i+1}/{min(limit, len(rows))})")
        
        details = fetch_entry_details(point['id'])
        if details:
            point['details'] = details
        
        grammar_points.append(point)
        time.sleep(1)  # Rate limiting
    
    if skipped > 0:
        print(f"\nSkipped {skipped} invalid rows")
    
    return grammar_points

def main():
    # Create output directory if it doesn't exist
    os.makedirs('output', exist_ok=True)
    
    # Scrape grammar points with proper encoding
    grammar_points = scrape_grammar_points()
    
    # Save to JSON with proper UTF-8 encoding
    output_file = 'output/grammar_points1.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'grammar_points': grammar_points
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\nCompleted! Saved {len(grammar_points)} grammar points to {output_file}")

if __name__ == '__main__':
    main()