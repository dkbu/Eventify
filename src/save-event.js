import { createEvent } from "ics";
import chrono from "chrono-node";

window.EventifySaveEvent = window.EventifySaveEvent || {
  save(eventDetails) {
    console.log("Eventify event saved:", eventDetails);
    ics.createEvent({
      start: chrono.parseDate(eventDetails.date),
      duration: { hours: 1, minutes: 0 },
      title: eventDetails.topic,
      description: eventDetails.description,
      location: eventDetails.location,
      geo: { lat: 0, lon: 0 },
      status: 'CONFIRMED',
      busyStatus: 'BUSY'
    }, (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(value);
    });
  }
};