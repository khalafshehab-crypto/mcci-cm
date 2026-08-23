import re

with open('src/pages/CommitteesEvents.tsx', 'r') as f:
    template = f.read()

# ----------------- Affiliates -----------------
affiliates = template
affiliates = affiliates.replace('CommitteesEvents', 'AffiliatesEvents')
affiliates = affiliates.replace('"events"', '"affiliates_events"')
affiliates = affiliates.replace('فعاليات اللجان', 'فعاليات المنتسبين')
affiliates = affiliates.replace('إدارة اللجان', 'إدارة المنتسبين')
affiliates = affiliates.replace('لوحة اللجان', 'لوحة المنتسبين')
affiliates = affiliates.replace('اللجنة', 'القطاع')
affiliates = affiliates.replace('لجنة', 'قطاع')
affiliates = affiliates.replace('اللجان', 'القطاعات')
affiliates = affiliates.replace('لجان', 'قطاعات')

# Employee filter for Affiliates (needs to be exact replace since we replaced 'اللجان')
# Wait, let's just do the employee filter FIRST before text replacements, or carefully.
