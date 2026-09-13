import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_error_block = r'''if (response.status === 401) {
        if (customToken) {
           console.warn("Target user token expired. Failing silently instead of asking the current user.");
           throw new Error("Target user token expired.");
        }'''

# Remove the block that throws "Target user token expired" directly
# If it's a custom token (e.g. Hussein creating for Abdulaziz), we can't trigger auth for Abdulaziz.
# But wait, earlier I changed createGoogleCalendarEvent so that if Abdulaziz's token fails,
# it throws `الموظف ${employeeEmail} لم يقم بربط حسابه بتقويم جوجل بعد.` or something similar.

# Actually, if the current user is Abdulaziz (isCurrentUser == true), then customToken IS NOT USED.
# Let's check createGoogleCalendarEvent logic again.
