# Eventify (Firefox Add-on)

This scaffold creates a basic Firefox add-on that finds dates in selected text using a right-click context menu.

## Features

- Adds a context menu item named **Find dates in selected text**
- Appears when text is selected
- Uses Chrono to parse dates and shows matches in a Firefox notification
- Supports partial dates containing month/day and assumes the current year

## Project Structure

- `manifest.json`: Firefox extension manifest
- `src/background.js`: Background script with context-menu behavior

## Run Locally in Firefox

1. Open Firefox.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` from this project.
5. Open any web page, select text, then right-click and choose **Find dates in selected text**.

## Notes

- This is a temporary load for development.
- Reload the extension from `about:debugging` after code changes.
