import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"calendar/v3/calendars/primary/events", {', '"calendar/v3/calendars/primary/events?sendUpdates=all", {')
content = content.replace('`calendar/v3/calendars/primary/events/${eventId}`', '`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`')

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
