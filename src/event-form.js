(() => {
  if (window.EventifyForm) {
    return;
  }

  const formId = "eventify-event-form";

  function closeForm() {
    document.getElementById(formId)?.remove();
  }

  function addOptions(select, values) {
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function show(details) {
    closeForm();

    const container = document.createElement("div");
    container.id = formId;
    container.innerHTML = `
      <section class="eventify-panel" role="dialog" aria-modal="true" aria-labelledby="eventify-title">
        <header><h2 id="eventify-title">Create Event</h2><button class="eventify-close" type="button" aria-label="Close">&times;</button></header>
        <form>
          <div class="eventify-row">
            <label>Date<select name="date"></select></label>
            <label>Time<select name="time"></select></label>
          </div>
          <label>Address<select name="location"></select></label>
          <label>PLZ<select name="plz"></select></label>
          <label>Topic<input name="topic" type="text"></label>
          <label>Description<textarea name="description"></textarea></label>
          <footer><button class="eventify-cancel" type="button">Cancel</button><button class="eventify-save" type="submit">Save</button></footer>
        </form>
      </section>`;

    const form = container.querySelector("form");
    addOptions(form.elements.date, details.dates || []);
    addOptions(form.elements.time, details.times || []);
    form.elements.description.value = details.description || "";
    addOptions(form.elements.location, details.location || []);
    addOptions(form.elements.plz, details.plz || []);
    container.querySelector(".eventify-close").addEventListener("click", closeForm);
    container.querySelector(".eventify-cancel").addEventListener("click", closeForm);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const eventDetails = Object.fromEntries(new FormData(form));
      browser.runtime.sendMessage({
        type: "eventify-save-event",
        eventDetails
      }).then(closeForm);
    });
    document.documentElement.appendChild(container);
    form.elements.date.focus();
  }

  window.EventifyForm = { show };
})();