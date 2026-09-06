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
    const wrapper = document.createElement("div");
    wrapper.className = "eventify-optional-field";

    const label = document.createElement("label");
    label.htmlFor = `eventify-${fieldName}`;
    label.textContent = fieldNameSeparated;

    const select = document.createElement("select");
    select.id = `eventify-${fieldName}`;
    select.name = fieldName;

    const manualLabel = document.createElement("label");
    manualLabel.className = "eventify-manual-toggle";
    const manualCheckbox = document.createElement("input");
    manualCheckbox.type = "checkbox";
    manualCheckbox.name = `manual${fieldName}`;
    manualLabel.append(manualCheckbox, " Insert manually");

    const manualInput = document.createElement("input");
    manualInput.type = "text";
    manualInput.name = `manual${fieldName}Value`;
    manualInput.style.display = "none";

    wrapper.append(label, select, manualLabel, manualInput);
    return wrapper;
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
    const panel = document.createElement("section");
    panel.className = "eventify-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "eventify-title");

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.id = "eventify-title";
    title.textContent = "Create Event";
    const closeButton = document.createElement("button");
    closeButton.className = "eventify-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "\u00d7";
    header.append(title, closeButton);

    const form = document.createElement("form");
    const optionalFields = document.createElement("div");
    optionalFields.className = "eventify-optional-fields";
    optionalFields.append(...manualOptionalFieldElements);

    const topicLabel = document.createElement("label");
    topicLabel.textContent = "Topic";
    const topicInput = document.createElement("input");
    topicInput.name = "topic";
    topicInput.type = "text";
    topicLabel.appendChild(topicInput);

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Description";
    const descriptionInput = document.createElement("textarea");
    descriptionInput.name = "description";
    descriptionLabel.appendChild(descriptionInput);

    const footer = document.createElement("footer");
    const cancelButton = document.createElement("button");
    cancelButton.className = "eventify-cancel";
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    const saveButton = document.createElement("button");
    saveButton.className = "eventify-save";
    saveButton.type = "submit";
    saveButton.textContent = "Save";
    footer.append(cancelButton, saveButton);

    form.append(optionalFields, topicLabel, descriptionLabel, footer);
    panel.append(header, form);
    container.appendChild(panel);
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