/* =========================================================
   INVITACIÓN DIGITAL — SCRIPT DEPURADO
   ========================================================= */

'use strict';

const INVITATION_BUILD = '2026-10-03c';
console.info('Invitación build', INVITATION_BUILD);

const envelope = document.getElementById('envelope-container');
const introStage = document.getElementById('intro-stage');
const envelopePaper = document.getElementById('envelope-paper');
const envelopeFlap = document.getElementById('envelope-flap');
const envelopeSeal = document.getElementById('envelope-seal');
const openEnvelopeBtn = document.getElementById('open-envelope-btn');
const storyVideoBtn = document.getElementById('start-story-video');
const storyVideoBtnLabel = storyVideoBtn?.querySelector('.story-video-btn-label');
const video = document.getElementById('intro-video');
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');
const skipBtn = document.getElementById('skip-video');
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');

let invitationStarted = false;
let openingStarted = false;
let videoStartRequested = false;
let videoTransitionStarted = false;
let revealObserver = null;

const FLAP_DURATION = 620;
const CARD_RISE_DURATION = 1220;
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

    // La carta permanece visible todo el tiempo que el invitado necesite.
    // El vídeo solo empieza tras un segundo gesto explícito del usuario,
    // compatible con las políticas de reproducción de Safari/iPhone.
    if (openEnvelopeBtn) openEnvelopeBtn.style.display = 'none';

    if (storyVideoBtn) {
        storyVideoBtn.hidden = false;
        requestAnimationFrame(() => {
            storyVideoBtn.classList.add('is-visible');
        });
    }
}

function transitionFromCardToVideo() {
    if (videoTransitionStarted) return;
    videoTransitionStarted = true;

    if (video) {
        video.style.display = 'block';
        requestAnimationFrame(() => video.classList.add('is-visible'));
    }

    if (skipBtn) skipBtn.style.display = 'block';

    if (introStage) {
        introStage.animate([
            { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
            { opacity: 0, transform: 'translate3d(0,12px,0) scale(.985)' }
        ], {
            duration: INTRO_FADE_DURATION,
            easing: 'cubic-bezier(.3,.7,.25,1)',
            fill: 'forwards'
        });

        window.setTimeout(() => {
            introStage.style.display = 'none';
        }, INTRO_FADE_DURATION);
    }
}

function resetVideoStartButton() {
    videoStartRequested = false;
    videoTransitionStarted = false;

    if (video) {
        video.pause();
        video.classList.remove('is-visible');
        video.style.display = 'none';
    }

    if (storyVideoBtn) {
        storyVideoBtn.disabled = false;
        storyVideoBtn.classList.add('is-visible');
    }

    if (storyVideoBtnLabel) {
        storyVideoBtnLabel.textContent = 'Intentar de nuevo';
    }

    // Si el vídeo no pudiera reproducirse por cualquier motivo,
    // el invitado siempre conserva una salida a la invitación.
    if (skipBtn) skipBtn.style.display = 'block';
}

function startStoryVideo() {
    if (invitationStarted || videoStartRequested || !video) return;
    videoStartRequested = true;

    if (storyVideoBtn) storyVideoBtn.disabled = true;
    if (storyVideoBtnLabel) storyVideoBtnLabel.textContent = 'Preparando…';

    // Preparamos el elemento antes de play(), pero lo mantenemos invisible.
    // La carta sigue en pantalla mientras el vídeo carga, evitando pantallas en blanco.
    video.style.display = 'block';
    video.classList.remove('is-visible');

    const onPlaying = () => {
        if (storyVideoBtnLabel) storyVideoBtnLabel.textContent = 'Ver nuestra historia';
        transitionFromCardToVideo();
    };

    video.addEventListener('playing', onPlaying, { once: true });

    let playback;
    try {
        // IMPORTANTE: play() se llama directamente dentro del click del usuario.
        // No hay awaits ni temporizadores antes de esta línea, para Safari/iPhone.
        playback = video.play();
    } catch (error) {
        video.removeEventListener('playing', onPlaying);
        console.error('No fue posible iniciar el vídeo:', error);
        resetVideoStartButton();
        return;
    }

    if (playback && typeof playback.catch === 'function') {
        playback.catch((error) => {
            video.removeEventListener('playing', onPlaying);
            console.error('El navegador bloqueó o no pudo iniciar el vídeo:', error);
            resetVideoStartButton();
        });
    }
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
storyVideoBtn?.addEventListener('click', startStoryVideo);
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
   RSVP DINÁMICO + CTA FLOTANTE + MODAL DE AGRADECIMIENTO
   ========================================================= */

const attendanceSelect = document.getElementById('asistencia');
const guestsGroup = document.getElementById('guests-group');
const guestsInput = document.getElementById('personas');
const floatingRsvp = document.getElementById('floating-rsvp');
const rsvpSection = document.getElementById('rsvp');

const rsvpThanksModal = document.getElementById('rsvp-thanks-modal');
const thanksTitle = document.getElementById('thanks-title');
const thanksCopy = document.getElementById('thanks-copy');
const guestMessageForm = document.getElementById('guest-message-form');
const guestMessageInput = document.getElementById('mensaje-novios');
const sendMessageBtn = document.getElementById('send-message-btn');
const messageResponse = document.getElementById('message-response');
const finishInvitationBtn = document.getElementById('finish-invitation');
const invitationFinale = document.getElementById('invitation-finale');

let currentRsvpId = '';

function createRsvpId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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

function openRsvpThanksModal(attendanceValue) {
    if (!rsvpThanksModal) return;

    const attending = attendanceValue === 'Sí, allí estaremos';
    if (thanksTitle) {
        thanksTitle.textContent = attending
            ? '¡Qué alegría saber que nos acompañarán!'
            : 'Gracias por hacernos saber';
    }
    if (thanksCopy) {
        thanksCopy.textContent = attending
            ? 'Tu confirmación quedó registrada. Nos hace mucha ilusión compartir este día contigo.'
            : 'Tu respuesta quedó registrada. Gracias por acompañarnos con tu cariño, incluso si esta vez no pueden estar presentes.';
    }

    if (guestMessageInput) guestMessageInput.value = '';
    if (messageResponse) messageResponse.textContent = '';
    if (sendMessageBtn) {
        sendMessageBtn.disabled = false;
        sendMessageBtn.textContent = 'Enviar mensaje';
    }

    rsvpThanksModal.hidden = false;
    rsvpThanksModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('rsvp-modal-open');

    window.requestAnimationFrame(() => {
        rsvpThanksModal.classList.add('is-visible');
        guestMessageInput?.focus({ preventScroll: true });
    });
}

function closeRsvpThanksModal() {
    if (!rsvpThanksModal) return;
    rsvpThanksModal.classList.remove('is-visible');
    document.body.classList.remove('rsvp-modal-open');
    window.setTimeout(() => {
        rsvpThanksModal.hidden = true;
        rsvpThanksModal.setAttribute('aria-hidden', 'true');
    }, 320);
}

function showInvitationFinale() {
    closeRsvpThanksModal();
    if (!invitationFinale) return;

    window.setTimeout(() => {
        invitationFinale.hidden = false;
        invitationFinale.setAttribute('aria-hidden', 'false');
        document.body.classList.add('invitation-finished');
        window.requestAnimationFrame(() => invitationFinale.classList.add('is-visible'));
    }, 260);
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

    const attendanceValue = String(attendanceSelect?.value || '');
    currentRsvpId = createRsvpId();
    const payload = new FormData(form);
    payload.append('action', 'rsvp');
    payload.append('rsvp_id', currentRsvpId);

    try {
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            body: payload
        });

        response.textContent = '¡Confirmación enviada!';
        form.reset();
        updateGuestsField();
        floatingRsvp?.classList.add('is-confirmed');
        openRsvpThanksModal(attendanceValue);
    } catch {
        response.textContent = 'Hubo un error de conexión. Por favor, intenta nuevamente.';
        currentRsvpId = '';
    } finally {
        button.textContent = 'Enviar confirmación';
        button.disabled = false;
    }
});

guestMessageForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = guestMessageInput?.value.trim() || '';
    if (!message) {
        if (messageResponse) messageResponse.textContent = 'Escribe unas palabras antes de enviarlas.';
        guestMessageInput?.focus();
        return;
    }

    if (!currentRsvpId) {
        if (messageResponse) messageResponse.textContent = 'No encontramos la confirmación asociada. Puedes escribirnos por WhatsApp al final de la invitación.';
        return;
    }

    if (sendMessageBtn) {
        sendMessageBtn.disabled = true;
        sendMessageBtn.textContent = 'Enviando...';
    }

    const messagePayload = new FormData();
    messagePayload.append('action', 'message');
    messagePayload.append('rsvp_id', currentRsvpId);
    messagePayload.append('mensaje', message);

    try {
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            body: messagePayload
        });

        if (messageResponse) messageResponse.textContent = 'Gracias por tus palabras ♡';
        if (guestMessageInput) guestMessageInput.disabled = true;
        if (sendMessageBtn) {
            sendMessageBtn.textContent = 'Mensaje enviado';
            sendMessageBtn.disabled = true;
        }
    } catch {
        if (messageResponse) messageResponse.textContent = 'No pudimos enviar el mensaje. Puedes intentarlo nuevamente.';
        if (sendMessageBtn) {
            sendMessageBtn.textContent = 'Enviar mensaje';
            sendMessageBtn.disabled = false;
        }
    }
});

finishInvitationBtn?.addEventListener('click', showInvitationFinale);
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
