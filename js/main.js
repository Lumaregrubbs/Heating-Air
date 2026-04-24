(function () {
  document.body.classList.add("js-enabled");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const estimateModal = document.getElementById("estimate-modal");
  const estimateForm = document.getElementById("estimate-quiz-form");
  const videoMessage = document.getElementById("video-message");
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

  document.querySelectorAll("[data-estimate-open], a[href='#estimate'], a[href='/#estimate'], a[href$='index.html#estimate']").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!estimateModal) return;
      event.preventDefault();
      if (videoMessage && !videoMessage.hidden) closeDialog(videoMessage);
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (estimateModal && !estimateModal.hidden) closeDialog(estimateModal);
      if (videoMessage && !videoMessage.hidden) closeDialog(videoMessage);
    }
  });

  if (estimateForm) {
    const steps = Array.from(estimateForm.querySelectorAll("[data-step]"));
    const backButton = estimateForm.querySelector("[data-quiz-back]");
    const nextButton = estimateForm.querySelector("[data-quiz-next]");
    const submitButton = estimateForm.querySelector("[data-quiz-submit]");
    const progressText = document.getElementById("quiz-progress-text");
    const progressBar = document.getElementById("quiz-progress-bar");
    const error = document.getElementById("quiz-error");
    let currentStep = 0;

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
      backButton.disabled = currentStep === 0;
      nextButton.hidden = currentStep === steps.length - 1;
      submitButton.hidden = currentStep !== steps.length - 1;
      nextButton.disabled = !stepIsValid();
      error.textContent = "";
    }

    estimateForm.addEventListener("change", updateStep);
    estimateForm.addEventListener("input", updateStep);

    nextButton.addEventListener("click", () => {
      if (!stepIsValid()) {
        error.textContent = "Please answer this step before continuing.";
        return;
      }
      currentStep = Math.min(currentStep + 1, steps.length - 1);
      updateStep();
      const heading = steps[currentStep].querySelector("h3");
      if (heading) heading.focus?.();
    });

    backButton.addEventListener("click", () => {
      currentStep = Math.max(currentStep - 1, 0);
      updateStep();
    });

    estimateForm.addEventListener("submit", (event) => {
      if (!stepIsValid() || !estimateForm.checkValidity()) {
        event.preventDefault();
        error.textContent = "Please complete the required contact fields before submitting.";
        const invalid = estimateForm.querySelector(":invalid");
        if (invalid) invalid.focus();
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

  if (window.location.hash === "#estimate" && estimateModal) {
    window.setTimeout(() => openDialog(estimateModal), 120);
  }
})();
