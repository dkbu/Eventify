(() => {
  if (window.EventifyForm) {
    return;
  }

  const formId = "eventify-event-form";

  function closeForm() {
    document.getElementById(formId)?.remove();
  }

  function createOptionallyManualField(fieldName) {
    const firstCapitalIndex = fieldName.search(/[A-Z]/);
    let fieldNameSeparated = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    if (firstCapitalIndex === -1) {
      // No additional capital letters found, keep the first letter capitalized
    } else {
      fieldNameSeparated = fieldNameSeparated.slice(0, firstCapitalIndex) + " " + fieldNameSeparated.charAt(firstCapitalIndex).toUpperCase() + fieldNameSeparated.slice(firstCapitalIndex + 1);
    }
    return `
      <div class="eventify-optional-field">
        <label for="eventify-${fieldName}">${fieldNameSeparated}</label>
        <select id="eventify-${fieldName}" name="${fieldName}"></select>
        <label class="eventify-manual-toggle"><input type="checkbox" name="manual${fieldName}"> Insert manually</label>
        <input type="text" name="manual${fieldName}Value" style="display:none">
      </div>
    `;
  }

  function addOptions(select, values) {
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function toggleDisplay(element, isVisible) {
    element.style.display = isVisible ? "inline-block" : "none";
    if (!isVisible) {
      element.value = "";
    }
  }


  function toggleManualDatetime(form, fieldName) {
    const manualFieldCheckbox = "manual" + fieldName;
    const manualFieldValue = manualFieldCheckbox + "Value";
    const autoField = fieldName;
    
    form.elements[manualFieldCheckbox].addEventListener("change", () => {
      toggleDisplay(form.elements[manualFieldValue], form.elements[manualFieldCheckbox].checked);
      toggleDisplay(form.elements[autoField], !form.elements[manualFieldCheckbox].checked);
    });
  }

  function initializeManualDatetimeToggles(form, fieldName, options) {
    addOptions(form.elements[fieldName], options || []);
    toggleManualDatetime(form, fieldName);
  }


  function show(details) {
    closeForm();

    const manualOptionalFields = ["date", "time", "endDate", "endTime", "location", "plz", "organizerEmail"];
    const manualOptionalFieldElements = manualOptionalFields.map(fieldName => createOptionallyManualField(fieldName));
    const manualOptions = {
      date: details.dates || [],
      time: details.times || [],
      endDate: details.dates || [],
      endTime: details.times || [],
      location: details.location || [],
      plz: details.plz || [],
      organizerEmail: details.organizerEmail || []
    };

    const container = document.createElement("div");
    container.id = formId;
    container.innerHTML = `
      <section class="eventify-panel" role="dialog" aria-modal="true" aria-labelledby="eventify-title">
        <header><h2 id="eventify-title">Create Event</h2><button class="eventify-close" type="button" aria-label="Close">&times;</button></header>
        <form>
          <div class="eventify-optional-fields">${manualOptionalFieldElements.join("")}</div>
          <label>Topic<input name="topic" type="text"></label>
          <label>Description<textarea name="description"></textarea></label>
          <footer><button class="eventify-cancel" type="button">Cancel</button><button class="eventify-save" type="submit">Save</button></footer>
        </form>
      </section>`;

    const form = container.querySelector("form");
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

    // Initialize manual datetime toggles for all datetime fields
    manualOptionalFields.forEach(fieldName => initializeManualDatetimeToggles(form, fieldName, manualOptions[fieldName]));
  }

  window.EventifyForm = { show };
})();