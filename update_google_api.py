import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

payload_regex = r'export interface GoogleCalendarEventPayload \{(.*?)\}'
replacement = r'''export interface GoogleCalendarEventPayload {\1  attendees?: { email: string }[];
}'''
content = re.sub(payload_regex, replacement, content, flags=re.DOTALL)

def fix_calendar_method(match):
    body = match.group(0)
    body = body.replace('end: event.end', 'end: event.end,\n      attendees: event.attendees || []')
    return body

content = re.sub(r'export async function createGoogleCalendarEvent.*?\}', fix_calendar_method, content, flags=re.DOTALL)
content = re.sub(r'export async function updateGoogleCalendarEvent.*?\}', fix_calendar_method, content, flags=re.DOTALL)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
