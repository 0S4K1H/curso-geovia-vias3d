const content = window.landingContent || {};

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
}

function makeWhatsAppUrl(number, message) {
  const normalized = String(number || "").replace(/\D/g, "");
  const text = encodeURIComponent(message || "");
  return normalized ? `https://wa.me/${normalized}?text=${text}` : "#";
}

function getYouTubeVideoId(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  try {
    const url = new URL(rawUrl);

    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v") || "";
    }

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }

    if (url.hostname.includes("youtube-nocookie.com")) {
      return url.pathname.split("/").filter(Boolean).pop() || "";
    }

    return "";
  } catch (_error) {
    return "";
  }
}

function toEmbedUrl(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  try {
    const url = new URL(rawUrl);
    const youtubeVideoId = getYouTubeVideoId(rawUrl);

    if (youtubeVideoId) {
      const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`);
      embedUrl.searchParams.set("rel", "0");

      if (/^https?:$/.test(window.location.protocol) && window.location.origin) {
        embedUrl.searchParams.set("origin", window.location.origin);
      }

      return embedUrl.toString();
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : rawUrl;
    }

    return rawUrl;
  } catch (_error) {
    return "";
  }
}

function isDirectVideoUrl(rawUrl) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(rawUrl || "");
}

function renderList(id, items) {
  const element = document.getElementById(id);
  if (!element || !Array.isArray(items)) {
    return;
  }

  element.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderHighlights(id, items) {
  const element = document.getElementById(id);
  if (!element || !Array.isArray(items)) {
    return;
  }

  element.innerHTML = items
    .map((item) => `<div class="highlight-item"><span>${item}</span></div>`)
    .join("");
}

function renderModules(items) {
  const container = document.getElementById("modules-grid");
  if (!container || !Array.isArray(items)) {
    return;
  }

  container.innerHTML = items
    .map(
      (module, index) => `
        <article class="module-card reveal">
          <span class="module-index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${module.title}</h3>
          <p>${module.description}</p>
        </article>
      `
    )
    .join("");
}

function renderCredentials(items) {
  const container = document.getElementById("credentials-list");
  if (!container || !Array.isArray(items)) {
    return;
  }

  container.innerHTML = items
    .map((item) => `<span class="credential-chip">${item}</span>`)
    .join("");
}

function renderContactChips(items) {
  const container = document.getElementById("contact-chips");
  if (!container || !Array.isArray(items)) {
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const tag = item.href ? "a" : "span";
      const href = item.href ? ` href="${item.href}" target="_blank" rel="noreferrer"` : "";
      return `<${tag} class="contact-chip"${href}><strong>${item.label}:</strong>${item.value}</${tag}>`;
    })
    .join("");
}

function renderVideo(video) {
  const frame = document.getElementById("video-frame");
  if (!frame || !video) {
    return;
  }

  if (window.location.protocol === "file:" && getYouTubeVideoId(video.url)) {
    frame.innerHTML = `
      <div class="video-placeholder">
        <div>
          <strong>Vista previa local detectada</strong>
          <p>YouTube puede bloquear embeds abiertos desde archivos locales y mostrar el error 153. En el dominio publicado o usando un servidor local, el embed debería funcionar mejor.</p>
          <a class="btn btn-secondary" href="${video.url}" target="_blank" rel="noopener">Ver video en YouTube</a>
        </div>
      </div>
    `;
    return;
  }

  if (isDirectVideoUrl(video.url)) {
    frame.innerHTML = `
      <video controls preload="metadata">
        <source src="${video.url}">
        Tu navegador no soporta la reproducción de video.
      </video>
    `;
    return;
  }

  const embedUrl = toEmbedUrl(video.url);
  if (embedUrl) {
    frame.innerHTML = `
      <div class="video-embed-shell">
        <iframe
          src="${embedUrl}"
          title="Video del curso"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
        <p class="video-direct-link">
          Si el embed falla en tu navegador, <a href="${video.url}" target="_blank" rel="noopener">abre el video directamente en YouTube</a>.
        </p>
      </div>
    `;
    return;
  }

  frame.innerHTML = `
    <div class="video-placeholder">
      <div>
        <strong>${video.fallbackTitle || "Video pendiente"}</strong>
        <p>${video.fallbackText || ""}</p>
      </div>
    </div>
  `;
}

function renderRegistration(registration) {
  const embed = document.getElementById("registration-embed");
  const link = document.getElementById("registration-link");
  const note = document.getElementById("registration-note");

  setText("registration-kicker", registration?.kicker);
  setText("registration-title", registration?.title);
  setText("registration-description", registration?.description);
  setText("registration-note", registration?.note);

  if (note) {
    note.style.display = registration?.note ? "block" : "none";
  }

  if (link) {
    link.href = registration?.publicUrl || "#";
  }

  if (!embed) {
    return;
  }

  if (registration?.embedInline && registration?.embedUrl) {
    embed.innerHTML = `
      <iframe
        src="${registration.embedUrl}"
        title="Formulario de registro del curso"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    `;
    return;
  }

  embed.innerHTML = `
    <div class="form-preview">
      <div>
        <span class="form-preview-badge">Registro oficial</span>
        <strong>Abre el formulario y completa tus datos</strong>
        <p>Serás dirigido al formulario del curso para registrar tu interés y continuar con la inscripción.</p>
      </div>
    </div>
  `;
}

function applyLinks(links) {
  const whatsappUrl = makeWhatsAppUrl(links?.whatsappNumber, links?.whatsappMessage);
  const paymentUrl = links?.paymentUrl || "#";
  const paymentFallbackUrl = makeWhatsAppUrl(
    links?.whatsappNumber,
    links?.paymentMessage || "Hola, quiero reservar mi cupo y recibir el enlace de pago."
  );
  const paymentNote = document.getElementById("payment-note");
  const ctaActions = document.getElementById("cta-actions");
  const hasRealPaymentUrl =
    paymentUrl && paymentUrl !== "#" && !paymentUrl.includes("example.com");
  const resolvedPaymentUrl = hasRealPaymentUrl ? paymentUrl : paymentFallbackUrl;

  ["nav-whatsapp", "hero-whatsapp", "footer-whatsapp", "floating-whatsapp"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.href = whatsappUrl;
    }
  });

  ["nav-payment", "hero-payment", "panel-payment", "cta-payment"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.href = resolvedPaymentUrl;
      element.style.display = "";
    }
  });

  if (paymentNote) {
    paymentNote.style.display = paymentNote.textContent.trim() ? "block" : "none";
  }

  if (ctaActions) {
    ctaActions.style.display = "flex";
  }
}

function applyStats(stats) {
  if (!Array.isArray(stats) || stats.length < 3) {
    return;
  }

  setText("stat-one-value", stats[0].value);
  setText("stat-one-label", stats[0].label);
  setText("stat-two-value", stats[1].value);
  setText("stat-two-label", stats[1].label);
  setText("stat-three-value", stats[2].value);
  setText("stat-three-label", stats[2].label);
}

function applyContent() {
  if (content.brand?.title) {
    document.title = content.brand.title;
  }

  setText("brand-title", content.brand?.title);
  setText("brand-subtitle", content.brand?.subtitle);

  setText("hero-badge", content.hero?.badge);
  setText("hero-title", content.hero?.title);
  setText("hero-description", content.hero?.description);
  setText("meta-modality", content.hero?.modality);
  setText("meta-duration", content.hero?.duration);
  setText("meta-price", content.hero?.price);
  setText("next-cohort-title", content.hero?.nextCohortTitle);
  setText("next-cohort-text", content.hero?.nextCohortText);

  renderHighlights("hero-highlights", content.hero?.highlights);
  renderList("target-audience", content.hero?.focusPoints || content.hero?.audience);
  applyStats(content.stats);

  setText("program-intro", content.program?.intro || content.programIntro);
  renderModules(content.program?.modules || content.modules);
  renderList("course-objectives", content.program?.objectives);
  renderList("program-outcomes", content.program?.outcomes);
  renderList("methodology-list", content.program?.methodology);

  setText("video-description", content.video?.description);
  renderVideo(content.video);
  renderList("benefits-list", content.video?.checklist || content.benefits);
  setText("result-text", content.video?.note || content.resultText);

  setText("payment-badge", content.payment?.badge);
  setText("payment-title", content.payment?.title);
  setText("payment-description", content.payment?.description);
  setText("payment-note-hero", content.payment?.note);

  setText("instructor-name", content.instructor?.name);
  setText("instructor-role", content.instructor?.role);
  setText("instructor-bio", content.instructor?.bio);
  renderList("experience-list", content.instructor?.experience);
  renderContactChips(content.instructor?.contacts);
  renderCredentials(content.instructor?.credentials);

  const photo = document.getElementById("instructor-photo");
  if (photo && content.instructor?.photo) {
    photo.src = content.instructor.photo;
    photo.alt = content.instructor.name || "Foto del instructor";
  }

  setText("cta-title", content.cta?.title);
  setText("cta-text", content.cta?.text);
  setText("payment-note", content.cta?.paymentNote);
  renderList("cta-points", content.cta?.points);

  renderRegistration(content.registration);

  setText("footer-copy", content.footer?.copy);
  applyLinks(content.links);
}

function applyRevealAnimation() {
  const elements = Array.from(document.querySelectorAll(".reveal"));
  if (!elements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 60, 300)}ms`;
    observer.observe(element);
  });
}

applyContent();
applyRevealAnimation();
