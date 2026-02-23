#!/usr/bin/env python3
"""
Enrich investor intro tracker with Obsidian vault intelligence.
Reads deal files, meetings, and synthesizes compelling descriptions.
"""

import json
import os
from pathlib import Path

# Company mapping: tracker name -> deal file slug
COMPANIES = {
    # High Priority
    "ConsenSys": "consensys",  # NET NEW - no deal file
    "Block (Square)": "block",  # NET NEW - no deal file
    "Nubank": "nubank",  # NET NEW - no deal file
    "Shopify": "shopify",
    "Klarna": "klarna",
    "Wise": "wise",  # Check for "transferwise" too
    "Visa": "visa",
    "PayPal": "paypal",
    "Stripe": "stripe",
    "Mastercard": "mastercard",  # NET NEW - no deal file

    # Medium Priority
    "Adyen": "adyen",
    "SumUp": "sumup",
    "Plaid": "plaid",
    "Tether": "tether",
    "MoneyGram": "moneygram",
    "BitGo": "bitgo",  # NET NEW - no deal file
    "Trade Republic": "trade-republic",
    "SoFi": "sofi",
    "Payoneer": "payoneer",
    "Worldline": "worldline",  # Check for variants
    "Phantom": "phantom",  # NET NEW - no deal file
}

VAULT_PATH = Path("/Users/szymonsypniewicz/Documents/szymon-vault")
DEALS_PATH = VAULT_PATH / "01-projects/project-rocket/deals"
MEETINGS_PATH = VAULT_PATH / "meetings"

def read_deal_file(slug):
    """Read deal file if it exists."""
    deal_file = DEALS_PATH / f"{slug}.md"
    if deal_file.exists():
        return deal_file.read_text()
    return None

def extract_deal_context(deal_content):
    """Extract key context from deal file content."""
    if not deal_content:
        return None

    context = {}
    lines = deal_content.split('\n')

    # Parse YAML frontmatter
    in_yaml = False
    for line in lines:
        if line.strip() == '---':
            in_yaml = not in_yaml
            continue

        if in_yaml:
            if ':' in line:
                key, val = line.split(':', 1)
                context[key.strip()] = val.strip().strip('"')

    # Extract Latest Activity section
    latest_activity = []
    in_activity = False
    for line in lines:
        if line.startswith('## Latest Activity'):
            in_activity = True
            continue
        if in_activity:
            if line.startswith('## '):
                break
            if line.strip().startswith('- '):
                latest_activity.append(line.strip())

    context['latest_activity'] = latest_activity

    # Extract first few paragraphs from notes if available
    notes_start = False
    notes = []
    for line in lines:
        if line.startswith('## Notes') or line.startswith('## Deal Summary') or line.startswith('## Strategic Context'):
            notes_start = True
            continue
        if notes_start:
            if line.startswith('## '):
                break
            if line.strip() and not line.startswith('#'):
                notes.append(line.strip())
                if len(notes) >= 5:  # First 5 lines of notes
                    break

    context['notes'] = ' '.join(notes)

    return context

def main():
    """Main enrichment process."""
    enriched = {}

    for company, slug in COMPANIES.items():
        print(f"\n=== Processing {company} ===")

        # Read deal file
        deal_content = read_deal_file(slug)
        if deal_content:
            print(f"✓ Found deal file: {slug}.md")
            context = extract_deal_context(deal_content)
            enriched[company] = {
                'slug': slug,
                'has_deal_file': True,
                'status': context.get('status', 'unknown'),
                'stage': context.get('stage', ''),
                'lead': context.get('lead', ''),
                'latest_activity': context.get('latest_activity', []),
                'notes': context.get('notes', ''),
            }
        else:
            print(f"✗ No deal file found for {slug}")
            enriched[company] = {
                'slug': slug,
                'has_deal_file': False,
                'status': 'NET NEW',
                'notes': 'No existing deal file - needs research'
            }

    # Save enriched data
    output_file = Path("/Users/szymonsypniewicz/Documents/tracker/enriched-data.json")
    with open(output_file, 'w') as f:
        json.dump(enriched, f, indent=2)

    print(f"\n✓ Enriched data saved to {output_file}")
    print(f"✓ Processed {len(enriched)} companies")
    print(f"  - {sum(1 for c in enriched.values() if c['has_deal_file'])} with deal files")
    print(f"  - {sum(1 for c in enriched.values() if not c['has_deal_file'])} NET NEW")

if __name__ == '__main__':
    main()
