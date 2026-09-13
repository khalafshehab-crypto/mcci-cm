import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

payload_regex = r'export interface GoogleCalendarEventPayload \{(.*?)\}'
replacement = r'''export interface GoogleCalendarEventPayload {\1  attendees?: { email: string }[];
}'''
content = re.sub(payload_regex, replacement, content, flags=re.DOTALL)

create_regex = r'body: JSON\.stringify\(\{([^}]+)\}\),'
create_replacement = r'''body: JSON.stringify({\1,
      attendees: event.attendees || [],
    }),'''
content = re.sub(create_regex, create_replacement, content)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
