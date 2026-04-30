(function () {
  document.body.classList.add("js-enabled");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const estimateModal = document.getElementById("estimate-modal");
  const estimateForm = document.getElementById("estimate-quiz-form");
  const videoMessage = document.getElementById("video-message");
  const promoModal = document.getElementById("promo-modal");
  const promoSessionKey = "alwaysPromoDismissed";
  let lastTrigger = null;

  const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

  function openDialog(dialog, trigger) {
    if (!dialog) return;
    lastTrigger = trigger || document.activeElement;
    dialog.hidden = false;
    document.body.classList.add("modal-open");
    const focusTarget = dialog.querySelector(focusableSelector);
    if (focusTarget) focusTarget.focus();
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    dialog.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  }

  function isInsideDialogClick(event, selector) {
    return event.target.closest(selector);
  }

  function promoWasDismissed() {
    try {
      return window.sessionStorage.getItem(promoSessionKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function rememberPromoDismissed() {
    try {
      window.sessionStorage.setItem(promoSessionKey, "true");
    } catch (error) {
      // Storage can be unavailable in some privacy modes. The popup still works without it.
    }
  }

  function closePromo() {
    rememberPromoDismissed();
    closeDialog(promoModal);
  }

  document.querySelectorAll("[data-estimate-open], a[href='#estimate'], a[href='/#estimate'], a[href$='index.html#estimate']").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!estimateModal) return;
      event.preventDefault();
      if (videoMessage && !videoMessage.hidden) closeDialog(videoMessage);
      if (promoModal && !promoModal.hidden) closePromo();
      openDialog(estimateModal, trigger);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(estimateModal));
  });

  if (estimateModal) {
    estimateModal.addEventListener("click", (event) => {
      if (!isInsideDialogClick(event, ".estimate-modal")) {
        closeDialog(estimateModal);
      }
    });
  }

  document.querySelectorAll("[data-video-message]").forEach((card) => {
    card.addEventListener("click", () => openDialog(videoMessage, card));
  });

  document.querySelectorAll("[data-message-close]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(videoMessage));
  });

  if (videoMessage) {
    videoMessage.addEventListener("click", (event) => {
      if (!isInsideDialogClick(event, ".message-card")) {
        closeDialog(videoMessage);
      }
    });
  }

  document.querySelectorAll("[data-promo-close]").forEach((button) => {
    button.addEventListener("click", closePromo);
  });

  if (promoModal) {
    promoModal.addEventListener("click", (event) => {
      if (!isInsideDialogClick(event, ".promo-image-card")) {
        closePromo();
      }
    });

    promoModal.querySelectorAll("a[href^='tel:']").forEach((link) => {
      link.addEventListener("click", rememberPromoDismissed);
    });

    if (!promoWasDismissed()) {
      window.setTimeout(() => {
        const anotherDialogIsOpen =
          (estimateModal && !estimateModal.hidden) ||
          (videoMessage && !videoMessage.hidden) ||
          promoWasDismissed();

        if (!anotherDialogIsOpen) {
          openDialog(promoModal);
        }
      }, 10000);
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (estimateModal && !estimateModal.hidden) closeDialog(estimateModal);
      if (videoMessage && !videoMessage.hidden) closeDialog(videoMessage);
      if (promoModal && !promoModal.hidden) closePromo();
    }
  });

  if (estimateForm) {
    const steps = Array.from(estimateForm.querySelectorAll("[data-step]"));
    const backButton = estimateForm.querySelector("[data-quiz-back]");
    const submitButton = estimateForm.querySelector("[data-quiz-submit]");
    const progressText = document.getElementById("quiz-progress-text");
    const progressBar = document.getElementById("quiz-progress-bar");
    const error = document.getElementById("quiz-error");
    let currentStep = 0;
    let autoAdvanceTimer = null;
    let isSubmitting = false;

    function activeFields() {
      return Array.from(steps[currentStep].querySelectorAll("input, textarea, select"));
    }

    function stepIsValid() {
      const fields = activeFields();
      const requiredRadios = new Set(
        fields
          .filter((field) => field.type === "radio" && field.required)
          .map((field) => field.name)
      );

      for (const name of requiredRadios) {
        if (!estimateForm.querySelector(`input[name="${name}"]:checked`)) return false;
      }

      return fields.every((field) => {
        if (field.type === "radio") return true;
        if (!field.required) return true;
        return field.checkValidity();
      });
    }

    function updateStep() {
      steps.forEach((step, index) => {
        step.hidden = index !== currentStep;
      });
      const progress = ((currentStep + 1) / steps.length) * 100;
      progressText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
      progressBar.style.width = `${progress}%`;
      backButton.disabled = isSubmitting || currentStep === 0;
      submitButton.hidden = currentStep !== steps.length - 1;
      submitButton.disabled = isSubmitting;
      error.textContent = "";
    }

    function setSubmitting(active) {
      isSubmitting = active;
      backButton.disabled = active || currentStep === 0;
      submitButton.disabled = active;
      submitButton.textContent = active ? "Sending Request..." : "Request My Free HVAC Estimate";
    }

    function focusStepHeading() {
      const heading = steps[currentStep].querySelector("h3");
      if (!heading) return;
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }

    function goToNextStep() {
      currentStep = Math.min(currentStep + 1, steps.length - 1);
      updateStep();
      focusStepHeading();
    }

    function scheduleAutoAdvance() {
      window.clearTimeout(autoAdvanceTimer);
      if (currentStep >= steps.length - 1 || !stepIsValid()) return;
      autoAdvanceTimer = window.setTimeout(goToNextStep, 220);
    }

    estimateForm.addEventListener("change", (event) => {
      updateStep();
      if (event.target.matches("input[type='radio']")) {
        scheduleAutoAdvance();
      }
    });

    estimateForm.addEventListener("input", updateStep);

    backButton.addEventListener("click", () => {
      window.clearTimeout(autoAdvanceTimer);
      currentStep = Math.max(currentStep - 1, 0);
      updateStep();
      focusStepHeading();
    });

    estimateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      window.clearTimeout(autoAdvanceTimer);

      if (!stepIsValid() || !estimateForm.checkValidity()) {
        error.textContent = "Please complete the required contact fields before submitting.";
        const invalid = estimateForm.querySelector(":invalid");
        if (invalid) invalid.focus();
        return;
      }

      if (isSubmitting) return;

      const honeypot = estimateForm.querySelector("input[name='_honey']");
      if (honeypot && honeypot.value) {
        return;
      }

      const formData = new FormData(estimateForm);
      const fullName = String(formData.get("fullName") || "AlwaysAC.net Lead").trim();
      const deliveryData = new FormData();

      deliveryData.set("_subject", `New HVAC Estimate Request from ${fullName}`);
      deliveryData.set("_template", "table");
      deliveryData.set("_captcha", "false");
      deliveryData.set("_next", "https://www.alwaysac.net/thank-you.html");
      deliveryData.set("Source", "Homepage modal quiz");
      deliveryData.set("What is going on with your system?", formData.get("systemIssue") || "Not provided");
      deliveryData.set("What type of system do you have?", formData.get("systemType") || "Not provided");
      deliveryData.set("How old is your system?", formData.get("systemAge") || "Not provided");
      deliveryData.set("What best describes your situation?", formData.get("situation") || "Not provided");
      deliveryData.set("What matters most to you?", formData.get("priority") || "Not provided");
      deliveryData.set("When would you like service?", formData.get("serviceTiming") || "Not provided");
      deliveryData.set("Additional details", formData.get("additionalDetails") || "Not provided");
      deliveryData.set("Full name", formData.get("fullName") || "Not provided");
      deliveryData.set("Phone", formData.get("phone") || "Not provided");
      deliveryData.set("Email", formData.get("email") || "Not provided");
      deliveryData.set("ZIP code", formData.get("zip") || "Not provided");
      deliveryData.set("Street address", formData.get("streetAddress") || "Not provided");
      deliveryData.set("Preferred contact method", formData.get("preferredContact") || "Not provided");
      deliveryData.set("Preliminary estimate acknowledgement", formData.get("acknowledgement") || "Not provided");

      setSubmitting(true);
      error.textContent = "Sending your estimate request...";

      try {
        const endpoint = estimateForm.dataset.ajaxAction || estimateForm.action;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: deliveryData
        });

        let result = null;
        try {
          result = await response.json();
        } catch (parseError) {
          result = null;
        }

        if (response.ok && (!result || result.success !== false)) {
          window.location.href = "thank-you.html";
          return;
        }

        error.textContent = "The request did not send. Please call (904) 310-0857 or try again.";
      } catch (sendError) {
        error.textContent = "The request did not send. Please call (904) 310-0857 or try again.";
      } finally {
        setSubmitting(false);
      }
    });

    updateStep();
  }

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

    const meterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
          meterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    document.querySelectorAll("[data-meter]").forEach((element) => meterObserver.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    document.querySelectorAll("[data-meter]").forEach((element) => element.classList.add("is-active"));
  }

  // Keep #estimate link targets from auto-opening on page load.
  // The quiz opens only after a visitor clicks an estimate CTA.
})();

