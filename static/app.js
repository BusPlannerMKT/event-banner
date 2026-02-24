// ── State ──
let currentImageUrl = '';
let currentLogoUrl = '';

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    // Attach live-preview listeners to all text inputs
    const fields = ['event_name', 'location', 'dates', 'cta_text'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });

    // Attach live-preview listeners to color pickers
    const colorFields = ['color_text', 'color_icon', 'color_cta_bg', 'color_cta_text'];
    colorFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                // Update hex display
                const hexEl = document.getElementById(id + '_hex');
                if (hexEl) hexEl.textContent = el.value.toUpperCase();
                updatePreview();
            });
        }
    });

    // Image upload
    const imageUpload = document.getElementById('image_upload');
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);

    // Logo upload
    const logoUpload = document.getElementById('logo_upload');
    if (logoUpload) logoUpload.addEventListener('change', handleLogoUpload);
});

// ── Color helpers ──
function getColor(id, fallback) {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
}

// ── Live Preview ──
function updatePreview() {
    const eventName = document.getElementById('event_name').value.trim();
    const location = document.getElementById('location').value.trim();
    const dates = document.getElementById('dates').value.trim();
    const ctaText = document.getElementById('cta_text').value.trim();

    // Colors
    const textColor = getColor('color_text', '#FFFFFF');
    const iconColor = getColor('color_icon', '#FFFFFF');
    const ctaBg = getColor('color_cta_bg', '#FCBA30');
    const ctaTextColor = getColor('color_cta_text', '#00274C');

    // If nothing is filled in, show empty state
    if (!eventName && !location && !dates && !ctaText && !currentImageUrl && !currentLogoUrl) {
        document.getElementById('banner-preview').innerHTML = `
            <div class="banner-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>Fill in the fields to see your banner</p>
            </div>`;
        return;
    }

    const bgStyle = currentImageUrl
        ? `background-image: url('${escapeHtml(currentImageUrl)}'); background-size: cover; background-position: center;`
        : 'background: #1a1a2e;';

    const logoHtml = currentLogoUrl
        ? `<img src="${escapeHtml(currentLogoUrl)}" alt="Logo" style="max-height:70px; max-width:280px; width:auto; height:auto; margin-bottom:20px; object-fit:contain;">`
        : `<div style="height:70px; width:200px; border:2px dashed rgba(255,255,255,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; color:rgba(255,255,255,0.4); font-size:12px;">Upload logo</div>`;

    // Map pin SVG icon (uses icon color)
    const pinIcon = `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" style="flex-shrink:0;">
        <path d="M7 0C3.13 0 0 3.13 0 7c0 4.87 6.25 10.5 6.52 10.74a.67.67 0 0 0 .96 0C7.75 17.5 14 11.87 14 7c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="${iconColor}"/>
    </svg>`;

    // Calendar SVG icon (uses icon color)
    const calendarIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;">
        <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="${iconColor}" stroke-width="1.5" fill="none"/>
        <line x1="1" y1="6.5" x2="15" y2="6.5" stroke="${iconColor}" stroke-width="1.5"/>
        <line x1="5" y1="1" x2="5" y2="4" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="11" y1="1" x2="11" y2="4" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

    // Arrow icon for CTA (uses CTA text color)
    const arrowIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0; margin-left:6px;">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="${ctaTextColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const preview = document.getElementById('banner-preview');
    preview.innerHTML = `
        <div class="banner" style="
            width: 100%;
            ${bgStyle}
            overflow: hidden;
            font-family: 'Montserrat', Arial, Helvetica, sans-serif;">
            <div style="
                background: linear-gradient(180deg, rgba(0,39,76,0.55) 0%, rgba(0,0,0,0.70) 100%);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                padding: 50px 50px; text-align: center;
                min-height: 450px;">

                ${logoHtml}

                <div style="font-size:28px; font-weight:800; color:${textColor}; line-height:1.2; margin-bottom:20px; text-transform:uppercase; letter-spacing:0.02em;">
                    ${escapeHtml(eventName) || '<span style="opacity:0.4;">Event Name</span>'}
                </div>

                ${location ? `
                <div style="display:flex; align-items:center; gap:6px; color:${textColor}; font-size:16px; font-weight:500;">
                    ${pinIcon}
                    ${escapeHtml(location)}
                </div>` : ''}

                ${dates ? `
                <div style="display:flex; align-items:center; gap:6px; font-size:16px; font-weight:500; color:${textColor}; margin-top:8px;">
                    ${calendarIcon}
                    ${escapeHtml(dates)}
                </div>` : ''}

                ${ctaText ? `
                <div style="margin-top:28px;">
                    <div style="display:inline-flex; align-items:center; background:${ctaBg}; color:${ctaTextColor}; padding:12px 32px; border-radius:25px; font-size:15px; font-weight:700;">
                        ${escapeHtml(ctaText)}
                        ${arrowIcon}
                    </div>
                </div>` : ''}
            </div>
        </div>`;
}

// ── Image Upload ──
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        currentImageUrl = ev.target.result;
        updatePreview();

        // Show file name
        document.getElementById('bg-upload-area').style.display = 'none';
        document.getElementById('bg-file-selected').style.display = 'flex';
        document.getElementById('bg-file-name').textContent = file.name;
    };
    reader.readAsDataURL(file);
}

function clearBackgroundImage() {
    currentImageUrl = '';
    document.getElementById('image_upload').value = '';
    document.getElementById('bg-upload-area').style.display = '';
    document.getElementById('bg-file-selected').style.display = 'none';
    updatePreview();
}

// ── Logo Upload ──
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        currentLogoUrl = ev.target.result;
        updatePreview();

        document.getElementById('logo-upload-area').style.display = 'none';
        document.getElementById('logo-file-selected').style.display = 'flex';
        document.getElementById('logo-file-name').textContent = file.name;
    };
    reader.readAsDataURL(file);
}

function clearLogo() {
    currentLogoUrl = '';
    document.getElementById('logo_upload').value = '';
    document.getElementById('logo-upload-area').style.display = '';
    document.getElementById('logo-file-selected').style.display = 'none';
    updatePreview();
}

// ── Suggest Image Search Terms ──
async function suggestImages() {
    const location = document.getElementById('location').value.trim();
    if (!location) {
        showToast('Enter a location first', true);
        return;
    }

    const btn = document.getElementById('suggest-btn');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Thinking...';

    try {
        const resp = await fetch('/api/suggest-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location }),
        });
        const data = await resp.json();

        if (data.error) {
            showToast(data.error, true);
            return;
        }

        const box = document.getElementById('suggestions-box');
        const list = document.getElementById('suggestions-list');
        list.innerHTML = data.suggestions.map(term =>
            `<span class="suggestion-chip" onclick="copySuggestion(this)" title="Click to copy">${escapeHtml(term)}</span>`
        ).join('');
        box.style.display = '';
    } catch (err) {
        showToast('Failed to get suggestions', true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

function copySuggestion(el) {
    navigator.clipboard.writeText(el.textContent).then(() => {
        showToast('Copied: ' + el.textContent);
    });
}

// ── Copy Mailchimp HTML ──
async function copyMailchimpHTML() {
    const data = getFormData();

    // Warn about local images
    const warnings = [];
    if (data.image_url && data.image_url.startsWith('data:')) {
        warnings.push('background image');
    }
    if (data.logo_url && data.logo_url.startsWith('data:')) {
        warnings.push('logo');
    }
    if (warnings.length > 0) {
        const proceed = confirm(
            `Your ${warnings.join(' and ')} ${warnings.length > 1 ? 'are' : 'is'} uploaded locally. ` +
            `For Mailchimp, you need publicly hosted image URLs.\n\n` +
            `Upload your images to Mailchimp Content Studio first, then replace the URLs in the HTML.\n\n` +
            `Copy the HTML anyway?`
        );
        if (!proceed) return;
    }

    try {
        const resp = await fetch('/api/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await resp.json();
        await navigator.clipboard.writeText(result.html);
        showToast('Mailchimp HTML copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy HTML', true);
    }
}

// ── Download PNG ──
async function downloadPNG() {
    const banner = document.querySelector('#banner-preview .banner');
    if (!banner) {
        showToast('Fill in the banner details first', true);
        return;
    }

    showToast('Generating PNG...');

    try {
        const canvas = await html2canvas(banner, {
            width: banner.offsetWidth,
            height: banner.offsetHeight,
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#000000',
        });

        const link = document.createElement('a');
        link.download = 'busplanner-event-banner.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('PNG downloaded!');
    } catch (err) {
        showToast('Failed to generate PNG', true);
    }
}

// ── Helpers ──
function getFormData() {
    return {
        event_name: document.getElementById('event_name').value.trim(),
        location: document.getElementById('location').value.trim(),
        dates: document.getElementById('dates').value.trim(),
        cta_text: document.getElementById('cta_text').value.trim(),
        image_url: currentImageUrl,
        logo_url: currentLogoUrl,
        color_text: getColor('color_text', '#FFFFFF'),
        color_icon: getColor('color_icon', '#FFFFFF'),
        color_cta_bg: getColor('color_cta_bg', '#FCBA30'),
        color_cta_text: getColor('color_cta_text', '#00274C'),
    };
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show' + (isError ? ' toast-error' : '');
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}
