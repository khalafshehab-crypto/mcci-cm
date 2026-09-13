import re

with open('src/pages/CommitteesEvents.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# createGoogleCalendarEvent(payload, targetEmail);
# We need to remove targetEmail! Because we removed the 2nd argument in `googleApi.ts`!
# Otherwise it might pass the email as an argument unnecessarily, but JS ignores extra arguments anyway.
# But just to be clean, let's remove it.

c_old = r'''const response = await createGoogleCalendarEvent(payload, targetEmail);'''
c_new = r'''const response = await createGoogleCalendarEvent(payload);'''
content = content.replace(c_old, c_new)

u_old = r'''await updateGoogleCalendarEvent(updatedGoogleEventIds[mainEmpName], payload, targetEmail);'''
u_new = r'''await updateGoogleCalendarEvent(updatedGoogleEventIds[mainEmpName], payload);'''
content = content.replace(u_old, u_new)

with open('src/pages/CommitteesEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
