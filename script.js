/* =========================================================
   INVITACIÓN DIGITAL — SCRIPT DEPURADO
   ========================================================= */

'use strict';

const envelope = document.getElementById('envelope-container');
const introStage = document.getElementById('intro-stage');
const envelopePaper = document.getElementById('envelope-paper');
const envelopeFlap = document.getElementById('envelope-flap');
const envelopeSeal = document.getElementById('envelope-seal');
const openEnvelopeBtn = document.getElementById('open-envelope-btn');
const video = document.getElementById('intro-video');
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');
const skipBtn = document.getElementById('skip-video');
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');

let invitationStarted = false;
let openingStarted = false;
let revealObserver = null;

const FLAP_DURATION = 620;
const CARD_RISE_DURATION = 1220;
const CARD_READ_TIME = 3900;
const INTRO_FADE_DURATION = 620;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function initializeReveals() {
    const elements = [...document.querySelectorAll('.animate.hidden:not([data-reveal-bound])')];
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('show'));
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });
    }

    elements.forEach((element) => {
        element.dataset.revealBound = 'true';
        revealObserver.observe(element);
    });
}

function startInvitation() {
    if (invitationStarted) return;
    invitationStarted = true;
    document.body.classList.add('invitation-active');

    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    if (skipBtn) skipBtn.style.display = 'none';

    if (mainContent) {
        mainContent.style.display = 'block';
        requestAnimationFrame(() => {
            mainContent.style.opacity = '1';
        });
    }

    if (introScreen) introScreen.classList.add('is-closing');

    if (music) {
        music.volume = 0.5;
        music.play()
            .then(() => {
                if (musicBtn) musicBtn.textContent = '⏸ Música';
            })
            .catch(() => {
                /* La reproducción automática puede estar bloqueada por el navegador. */
            });
    }

    initializeReveals();

    window.setTimeout(() => {
        if (introScreen) introScreen.style.display = 'none';
        if (musicBtn) musicBtn.style.display = 'block';
    }, 1150);
}

async function playIntroVideo() {
    if (invitationStarted || openingStarted || !envelope || !envelopePaper || !envelopeFlap) return;
    openingStarted = true;

    envelope.style.pointerEvents = 'none';
    envelope.classList.add('is-opening');

    if (openEnvelopeBtn) {
        openEnvelopeBtn.disabled = true;
        openEnvelopeBtn.classList.add('is-hiding');
    }

    if (envelopeSeal) {
        envelopeSeal.animate([
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(.76)' }
        ], {
            duration: 260,
            easing: 'cubic-bezier(.3,.7,.3,1)',
            fill: 'forwards'
        });
    }

    const flapAnimation = envelopeFlap.animate([
        { transform: 'rotateX(0deg)' },
        { transform: 'rotateX(-178deg)' }
    ], {
        duration: FLAP_DURATION,
        easing: 'cubic-bezier(.22,.72,.24,1)',
        fill: 'forwards'
    });

    await sleep(180);
    envelopePaper.style.opacity = '1';
    envelopePaper.style.zIndex = '2';

    const cardAnimation = envelopePaper.animate([
        {
            transform: 'translate3d(-50%, 18%, 0) scale(.78)',
            opacity: 0,
            offset: 0
        },
        {
            transform: 'translate3d(-50%, 5%, 0) scale(.79)',
            opacity: 1,
            offset: .10
        },
        {
            transform: 'translate3d(-50%, -42%, 0) scale(.90)',
            opacity: 1,
            offset: .68
        },
        {
            transform: 'translate3d(-50%, -75%, 0) scale(1)',
            opacity: 1,
            offset: 1
        }
    ], {
        duration: CARD_RISE_DURATION,
        easing: 'cubic-bezier(.18,.72,.22,1)',
        fill: 'forwards'
    });

    await sleep(1020);
    envelopePaper.style.zIndex = '7';
    envelope.classList.add('card-cleared');

    await Promise.allSettled([flapAnimation.finished, cardAnimation.finished]);
    envelope.classList.add('is-open');

    await sleep(CARD_READ_TIME);

    if (video) {
        video.style.display = 'block';
        requestAnimationFrame(() => video.classList.add('is-visible'));
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') playback.catch(() => {});
    }

    if (skipBtn) skipBtn.style.display = 'block';

    if (introStage) {
        introStage.animate([
            { opacity: 1, transform: 'translate3d(0,0,0)' },
            { opacity: 0, transform: 'translate3d(0,16px,0)' }
        ], {
            duration: INTRO_FADE_DURATION,
            easing: 'cubic-bezier(.3,.7,.25,1)',
            fill: 'forwards'
        });
    }

    envelopePaper.animate([
        { transform: 'translate3d(-50%, -75%, 0) scale(1)', opacity: 1 },
        { transform: 'translate3d(-50%, -79%, 0) scale(1.01)', opacity: 0 }
    ], {
        duration: INTRO_FADE_DURATION,
        easing: 'cubic-bezier(.3,.7,.25,1)',
        fill: 'forwards'
    });

    await sleep(INTRO_FADE_DURATION);
    if (introStage) introStage.style.display = 'none';
}

function openEnvelope() {
    if (openingStarted || invitationStarted) return;
    playIntroVideo();
}

if (envelope) {
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openEnvelope();
    });
}

openEnvelopeBtn?.addEventListener('click', openEnvelope);
video?.addEventListener('ended', startInvitation);
skipBtn?.addEventListener('click', startInvitation);

/* =========================================================
   MÚSICA
   ========================================================= */

if (musicBtn && music) {
    musicBtn.addEventListener('click', () => {
        if (music.paused) {
            music.play()
                .then(() => {
                    musicBtn.textContent = '⏸ Música';
                })
                .catch(() => {
                    musicBtn.textContent = '▶ Música';
                });
        } else {
            music.pause();
            musicBtn.textContent = '▶ Música';
        }
    });
}

/* =========================================================
   CUENTA REGRESIVA
   ========================================================= */

const eventDate = new Date(2026, 11, 5, 9, 0, 0).getTime();
const countdownNodes = {
    days: document.getElementById('dias'),
    hours: document.getElementById('horas'),
    minutes: document.getElementById('min'),
    seconds: document.getElementById('seg')
};

function updateCountdown() {
    if (Object.values(countdownNodes).some((node) => !node)) return false;

    const distance = eventDate - Date.now();
    if (distance <= 0) {
        Object.values(countdownNodes).forEach((node) => {
            node.textContent = '00';
        });
        return false;
    }

    countdownNodes.days.textContent = String(Math.floor(distance / 86400000)).padStart(2, '0');
    countdownNodes.hours.textContent = String(Math.floor((distance % 86400000) / 3600000)).padStart(2, '0');
    countdownNodes.minutes.textContent = String(Math.floor((distance % 3600000) / 60000)).padStart(2, '0');
    countdownNodes.seconds.textContent = String(Math.floor((distance % 60000) / 1000)).padStart(2, '0');
    return true;
}

if (updateCountdown()) {
    const countdownInterval = window.setInterval(() => {
        if (!updateCountdown()) window.clearInterval(countdownInterval);
    }, 1000);
}

/* =========================================================
   CALENDARIO
   ========================================================= */

const calendarBtn = document.getElementById('add-calendar');

calendarBtn?.addEventListener('click', () => {
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Elizabeth & Victor//Invitacion 2026//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:elizabeth-victor-camille-20261205@invitacion.local',
        'DTSTAMP:20260924T000000Z',
        'DTSTART;TZID=America/Guayaquil:20261205T090000',
        'SUMMARY:Boda Elizabeth & Víctor + Bautizo de Camille',
        'LOCATION:Iglesia Chillo Compañía, Sangolquí, Ecuador',
        'DESCRIPTION:Ceremonia conjunta a las 09:00. Recepción a continuación en Quinta El Carmen, Sangolquí.',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Elizabeth-Victor-Camille-05-12-2026.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});

/* =========================================================
   REGALO
   ========================================================= */

const giftToggle = document.getElementById('gift-toggle');
const giftPanel = document.getElementById('gift-panel');
const copyAccountBtn = document.getElementById('copy-account');
const copyFeedback = document.getElementById('copy-feedback');

if (giftToggle && giftPanel) {
    giftToggle.addEventListener('click', () => {
        const isOpen = giftToggle.getAttribute('aria-expanded') === 'true';
        giftToggle.setAttribute('aria-expanded', String(!isOpen));
        giftPanel.hidden = isOpen;
        giftToggle.textContent = isOpen ? '♡ Ver opción de regalo' : '♡ Ocultar opción de regalo';
    });
}

copyAccountBtn?.addEventListener('click', async () => {
    const account = document.getElementById('bank-account')?.textContent?.trim() || '';
    if (!account) return;

    try {
        await navigator.clipboard.writeText(account);
    } catch {
        const temp = document.createElement('textarea');
        temp.value = account;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
    }

    if (copyFeedback) {
        copyFeedback.textContent = 'Número de cuenta copiado.';
        window.setTimeout(() => {
            copyFeedback.textContent = '';
        }, 2200);
    }
});

/* =========================================================
   RSVP DINÁMICO + CTA FLOTANTE
   ========================================================= */

const attendanceSelect = document.getElementById('asistencia');
const guestsGroup = document.getElementById('guests-group');
const guestsInput = document.getElementById('personas');
const floatingRsvp = document.getElementById('floating-rsvp');
const rsvpSection = document.getElementById('rsvp');

function updateGuestsField() {
    if (!attendanceSelect || !guestsGroup || !guestsInput) return;
    const attending = attendanceSelect.value === 'Sí, allí estaremos';
    guestsGroup.classList.toggle('is-hidden', !attending);
    guestsInput.required = attending;
    guestsInput.disabled = !attending;
    if (!attending) guestsInput.value = '';
}

if (attendanceSelect) {
    attendanceSelect.addEventListener('change', updateGuestsField);
    updateGuestsField();
}

if (floatingRsvp && rsvpSection) {
    floatingRsvp.addEventListener('click', (event) => {
        event.preventDefault();
        rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => rsvpSection.focus({ preventScroll: true }), 650);
    });

    if ('IntersectionObserver' in window) {
        const rsvpVisibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                floatingRsvp.classList.toggle('is-near-rsvp', entry.isIntersecting);
            });
        }, {
            threshold: 0.12,
            rootMargin: '-8% 0px -8% 0px'
        });
        rsvpVisibilityObserver.observe(rsvpSection);
    }
}

const scriptURL = 'https://script.google.com/macros/s/AKfycbx6kSCR04kuQr9g3UkfsNht1xD2uwH5Tyw7A9b2_dJ9Ax14ySDMxgaRnxY2gLKX8w90/exec';
const form = document.getElementById('rsvp-form');

form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = document.getElementById('btn-submit');
    const response = document.getElementById('form-response');
    if (!button || !response) return;

    button.textContent = 'Enviando...';
    button.disabled = true;

    if (scriptURL.includes('REEMPLAZAR_CON_URL')) {
        response.textContent = 'Formulario listo. Solo falta conectar la URL de Google Apps Script para recibir confirmaciones.';
        button.textContent = 'Enviar confirmación';
        button.disabled = false;
        return;
    }

    try {
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            body: new FormData(form)
        });

        response.textContent = '¡Confirmación exitosa! Nos vemos pronto.';
        form.reset();
        updateGuestsField();
        floatingRsvp?.classList.add('is-confirmed');
    } catch {
        response.textContent = 'Hubo un error de conexión. Por favor, intenta nuevamente.';
    } finally {
        button.textContent = 'Enviar confirmación';
        button.disabled = false;
    }
});

/* =========================================================
   LIGHTBOX DE LA GALERÍA
   ========================================================= */

const storyLightbox = document.getElementById('story-lightbox');
const storyLightboxImage = document.getElementById('story-lightbox-image');
const storyLightboxCaption = document.getElementById('story-lightbox-caption');
const storyLightboxCounter = document.getElementById('story-lightbox-counter');
const storyLightboxClose = document.querySelector('.story-lightbox-close');
const storyLightboxPrev = document.querySelector('.story-lightbox-prev');
const storyLightboxNext = document.querySelector('.story-lightbox-next');
const storyGalleryItems = [...document.querySelectorAll('.mosaic-photo')];

let storyGalleryIndex = 0;
let storyLastFocused = null;

function renderStoryLightbox(index) {
    if (!storyLightboxImage || !storyGalleryItems.length) return;

    storyGalleryIndex = (index + storyGalleryItems.length) % storyGalleryItems.length;
    const image = storyGalleryItems[storyGalleryIndex].querySelector('img');
    if (!image) return;

    storyLightboxImage.src = image.currentSrc || image.src;
    storyLightboxImage.alt = image.alt || 'Foto de nuestra historia';
    if (storyLightboxCaption) storyLightboxCaption.textContent = image.alt || '';
    if (storyLightboxCounter) storyLightboxCounter.textContent = `${storyGalleryIndex + 1} / ${storyGalleryItems.length}`;
}

function openStoryLightbox(button) {
    if (!storyLightbox) return;
    const index = storyGalleryItems.indexOf(button);
    if (index < 0) return;

    storyLastFocused = document.activeElement;
    renderStoryLightbox(index);
    storyLightbox.hidden = false;
    storyLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    storyLightboxClose?.focus();
}

function closeStoryLightbox() {
    if (!storyLightbox) return;
    storyLightbox.hidden = true;
    storyLightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    storyLightboxImage?.removeAttribute('src');
    storyLastFocused?.focus?.();
}

storyGalleryItems.forEach((button) => {
    button.addEventListener('click', () => openStoryLightbox(button));
});

storyLightboxClose?.addEventListener('click', closeStoryLightbox);
storyLightboxPrev?.addEventListener('click', () => renderStoryLightbox(storyGalleryIndex - 1));
storyLightboxNext?.addEventListener('click', () => renderStoryLightbox(storyGalleryIndex + 1));

storyLightbox?.addEventListener('click', (event) => {
    if (event.target === storyLightbox) closeStoryLightbox();
});

document.addEventListener('keydown', (event) => {
    if (!storyLightbox || storyLightbox.hidden) return;
    if (event.key === 'Escape') closeStoryLightbox();
    if (event.key === 'ArrowLeft') renderStoryLightbox(storyGalleryIndex - 1);
    if (event.key === 'ArrowRight') renderStoryLightbox(storyGalleryIndex + 1);
});

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReveals, { once: true });
} else {
    initializeReveals();
}
