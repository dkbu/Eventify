# Eventify (Firefox Add-on)

This Firefox add-on allows generating a calendar event (in the form of an ics file).

Download here: https://addons.mozilla.org/en-US/firefox/addon/eventify/

## Features

- Recognizes dates and times in the text
- Allows use of text data or manually adding

## Project Structure

- `manifest.json`: Firefox extension manifest
- `src/background.js`: Background script with context-menu behavior, locates data in selected text
- `src/event-form.js`: Displays the event generation form
- `src/save-event.js`: Saves the form's entries into an ics file

## Build
1. `npm run build`

## Run Locally in Firefox

1. Open Firefox.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` from this project.
5. Open any web page, select text, then right-click and choose **Find dates in selected text**.

## Notes

- This is a temporary load for development.
- Reload the extension from `about:debugging` after code changes.
