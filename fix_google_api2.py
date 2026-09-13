import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Revert the corrupted bodies
content = content.replace(',\n      attendees: event.attendees || [],\n    })', '})')
# The original ones didn't have a trailing comma for the last element, but my regex might have added it.
content = content.replace('      values,\n    })', '      values\n    })')
content = content.replace('      due: task.due || undefined,\n    })', '      due: task.due || undefined\n    })')
content = content.replace('      text,\n    })', '      text\n    })')
content = content.replace('      end: event.end,\n    })', '      end: event.end\n    })')

# Revert payload
content = content.replace('    timeZone?: string;\n    attendees?: { email: string }[];\n};', '    timeZone?: string;\n  };')

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
