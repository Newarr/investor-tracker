#!/usr/bin/env python3
"""
Update investor-intro-links.html with enriched company descriptions.
"""

import json
import re
from pathlib import Path

def load_enriched_descriptions():
    """Load enriched descriptions from JSON."""
    with open('/Users/szymonsypniewicz/Documents/tracker/enriched-descriptions.json', 'r') as f:
        return json.load(f)

def update_html_with_enrichment(html_content, enriched_data):
    """
    Update HTML card bodies with enriched descriptions.
    Finds each company's card-body-inner div and replaces content.
    """

    for company, description in enriched_data.items():
        # Pattern to find the company's card and its body
        # We need to be careful with regex - match the company header, then find its card-body-inner

        # First, let's create a pattern that finds the company name in the header
        # and then captures until the closing </div></div> of the card-body

        # Escape company name for regex
        company_escaped = re.escape(company)

        # Pattern: find the company, then find the next card-body-inner section
        # This is tricky because HTML is nested. Let's use a more robust approach:
        # Find the line with the company name, then find the next card-body-inner

        # Split into lines for easier manipulation
        lines = html_content.split('\n')

        # Find the line index where this company appears in card-company div
        company_line_idx = None
        for i, line in enumerate(lines):
            if f'<div class="card-company">' in line and company in line:
                company_line_idx = i
                break

        if company_line_idx is None:
            print(f"WARNING: Could not find company {company} in HTML")
            continue

        # Now find the next card-body-inner after this line
        body_start_idx = None
        body_end_idx = None

        for i in range(company_line_idx, len(lines)):
            if '<div class="card-body-inner">' in lines[i]:
                body_start_idx = i
                # Find the closing </div></div> (card-body-inner closes, then card-body closes)
                for j in range(i + 1, len(lines)):
                    if '</div></div>' in lines[j]:
                        body_end_idx = j
                        break
                break

        if body_start_idx is None or body_end_idx is None:
            print(f"WARNING: Could not find card-body for {company}")
            continue

        # Replace the content
        # Keep the opening div, replace content, keep closing divs
        opening = lines[body_start_idx]  # <div class="card-body-inner">
        closing = lines[body_end_idx]    # </div></div>

        # Create new content lines
        new_content = [
            opening,
            f"        {description}",
            "      " + closing  # Preserve indentation
        ]

        # Replace in lines array
        lines[body_start_idx:body_end_idx+1] = new_content

        # Rejoin
        html_content = '\n'.join(lines)

        print(f"✓ Updated {company}")

    return html_content

def main():
    """Main update process."""

    # Load enriched descriptions
    print("Loading enriched descriptions...")
    enriched = load_enriched_descriptions()
    print(f"✓ Loaded {len(enriched)} enriched descriptions")

    # Read HTML
    html_path = Path('/Users/szymonsypniewicz/Documents/tracker/investor-intro-links.html')
    print(f"\nReading HTML from {html_path}...")
    html_content = html_path.read_text()

    # Update HTML
    print("\nUpdating HTML with enriched descriptions...")
    updated_html = update_html_with_enrichment(html_content, enriched)

    # Write updated HTML
    output_path = Path('/Users/szymonsypniewicz/Documents/tracker/investor-intro-links-enriched.html')
    output_path.write_text(updated_html)
    print(f"\n✓ Updated HTML saved to {output_path}")

    # Also update the original file
    html_path.write_text(updated_html)
    print(f"✓ Original HTML updated at {html_path}")

if __name__ == '__main__':
    main()
