import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# First, revert the bad payload
content = content.replace('    attendees?: { email: string }[];\n};', '  };')

# Then append attendees at the end of interface
content = content.replace('export interface GoogleCalendarEventPayload {\n  summary: string;\n  description?: string;\n  start: {\n    dateTime?: string;\n    date?: string;\n    timeZone?: string;\n  };\n  end: {\n    dateTime?: string;\n    date?: string;\n    timeZone?: string;\n  };\n}', 'export interface GoogleCalendarEventPayload {\n  summary: string;\n  description?: string;\n  start: {\n    dateTime?: string;\n    date?: string;\n    timeZone?: string;\n  };\n  end: {\n    dateTime?: string;\n    date?: string;\n    timeZone?: string;\n  };\n  attendees?: { email: string }[];\n}')

# Now check if attendees was added correctly to the create/update functions
# Wait, they weren't matched because the regex was too strict or failed.
# Let's do it manually.
content = content.replace('      end: event.end\n    })', '      end: event.end,\n      attendees: event.attendees || []\n    })')

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
