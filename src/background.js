const MENU_ID = "eventify-find-dates";

function toLocalISOString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
  const offsetRemainder = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetRemainder}`;
}

function findDatesAndTimes(text) {
  const results = chrono.de.parse(text);
  const dates = results.map(result => {
    const [date, ] = toLocalISOString(result.start.date()).split("T");
    return date || "";
  });

  const times = results.map(result => {
    const [, time] = toLocalISOString(result.start.date()).split("T");
    return time || "";
  });


  return { dates, times };
}

function findAddress(text) {
  const results = text.match(/[A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|weg|platz|allee|gasse)\s+\d+[a-zA-Z]?/i);
  return results || [];
}

function findPLZ(text) {
  const results = text.match(/\b\d{5}\b/g);
  return results || [];
}

function findOrganizerEmail(text) {
  const results = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return results || [];
}

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: MENU_ID,
    title: "Generate Calendar Event",
    contexts: ["selection"]
  });
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== "eventify-save-event" || !sender.tab?.id) {
    return;
  }

  const options = sender.frameId !== undefined ? { frameId: sender.frameId } : {};
  const eventDetails = JSON.stringify(message.eventList);
  return browser.tabs.executeScript(sender.tab.id, { ...options, file: "src/vendor/ics.js" })
  .then(() => browser.tabs.executeScript(sender.tab.id, { ...options, file: "src/vendor/chrono.js" }))
  .then(() => browser.tabs.executeScript(sender.tab.id, { ...options, file: "src/save-event.js" }))
  .then(() => browser.tabs.executeScript(sender.tab.id, {
    ...options,
    code: `window.EventifySaveEvent.save(${eventDetails});`
  }))
  .catch(error => console.error("Unable to save Eventify event:", error));  
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  const selection = (info.selectionText || "").trim();
  if (!selection) {
    return;
  }

  const datesAndTimes = findDatesAndTimes(selection);
  const address = findAddress(selection);
  const plz = findPLZ(selection);
  const eventDetails = {
    dates: datesAndTimes.dates,
    times: datesAndTimes.times,
    description: selection,
    location: address,
    plz: plz,
    organizerEmail: findOrganizerEmail(selection)
  };

  if (!tab || !tab.id) {
    return;
  }

  const execOptions = info.frameId !== undefined ? { frameId: info.frameId } : {};

  Promise.all([
    browser.tabs.insertCSS(tab.id, { ...execOptions, file: "src/event-form.css" }),
    browser.tabs.executeScript(tab.id, { ...execOptions, file: "src/event-form.js" })
  ])
    .then(() => browser.tabs.executeScript(tab.id, {
      ...execOptions,
      code: `window.EventifyForm.show(${JSON.stringify(eventDetails)});`
    }))
    .catch(error => console.error("Unable to show Eventify form:", error));
});
