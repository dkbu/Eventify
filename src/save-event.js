
window.EventifySaveEvent = window.EventifySaveEvent || {
  save(eventDetails) {
    const eventDate = chrono.parseDate((eventDetails.date || eventDetails.manualdateValue) + " " + (eventDetails.time || eventDetails.manualtimeValue));
    const endDate = chrono.parseDate((eventDetails.endDate || eventDetails.manualendDateValue) + " " + (eventDetails.endTime || eventDetails.manualendTimeValue));
    console.log("Eventify event saved:", eventDetails);
    ics.createEvent({
      start: [eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate(), eventDate.getHours(), eventDate.getMinutes()],
      end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
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
      const blob = new Blob([value], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =  eventDetails.topic + ".ics";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
};