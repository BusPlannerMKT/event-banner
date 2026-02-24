// ── State ──
let currentImageUrl = '';
let currentLogoUrl = '';
let currentPartnerLogoUrl = '';

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    // Attach live-preview listeners to all text inputs
    const fields = ['event_name', 'subheading', 'location', 'dates', 'cta_text'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });

    // Attach live-preview listeners to color pickers and hex inputs
    const colorFields = ['color_text', 'color_icon', 'color_cta_bg', 'color_cta_text'];
    colorFields.forEach(id => {
        const picker = document.getElementById(id);
        const hexInput = document.getElementById(id + '_hex');

        if (picker) {
            // Color picker → update hex input + preview
            picker.addEventListener('input', () => {
                if (hexInput) hexInput.value = picker.value.toUpperCase();
                updatePreview();
            });
        }

        if (hexInput) {
            // Hex input → update color picker + preview
            hexInput.addEventListener('input', () => {
                let val = hexInput.value.trim();
                // Add # if missing
                if (val && !val.startsWith('#')) val = '#' + val;
                // Validate hex color
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    if (picker) picker.value = val;
                    updatePreview();
                }
            });
            // On blur, normalize the value
            hexInput.addEventListener('blur', () => {
                let val = hexInput.value.trim();
                if (val && !val.startsWith('#')) val = '#' + val;
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    hexInput.value = val.toUpperCase();
                    if (picker) picker.value = val;
                    updatePreview();
                } else if (picker) {
                    // Reset to picker value if invalid
                    hexInput.value = picker.value.toUpperCase();
                }
            });
        }
    });

    // Attach live-preview listeners to font size inputs
    const fontSizeFields = ['fs_title', 'fs_subheading', 'fs_details', 'fs_cta'];
    fontSizeFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });

    // Logo size slider
    const logoSizeSlider = document.getElementById('logo_size');
    if (logoSizeSlider) {
        logoSizeSlider.addEventListener('input', () => {
            document.getElementById('logo_size_value').textContent = logoSizeSlider.value + 'px';
            updatePreview();
        });
    }

    // Partner logo size slider
    const partnerLogoSizeSlider = document.getElementById('partner_logo_size');
    if (partnerLogoSizeSlider) {
        partnerLogoSizeSlider.addEventListener('input', () => {
            document.getElementById('partner_logo_size_value').textContent = partnerLogoSizeSlider.value + 'px';
            updatePreview();
        });
    }

    // Image upload
    const imageUpload = document.getElementById('image_upload');
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);

    // Logo upload
    const logoUpload = document.getElementById('logo_upload');
    if (logoUpload) logoUpload.addEventListener('change', handleLogoUpload);

    // Partner logo upload
    const partnerLogoUpload = document.getElementById('partner_logo_upload');
    if (partnerLogoUpload) partnerLogoUpload.addEventListener('change', handlePartnerLogoUpload);

    // Enter key triggers image search
    const searchInput = document.getElementById('image-search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchImages();
            }
        });
    }
});

// ── Color helpers ──
function getColor(id, fallback) {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
}

// ── Live Preview ──
function updatePreview() {
    const eventName = document.getElementById('event_name').value.trim();
    const subheading = document.getElementById('subheading').value.trim();
    const location = document.getElementById('location').value.trim();
    const dates = document.getElementById('dates').value.trim();
    const ctaText = document.getElementById('cta_text').value.trim();

    // Font sizes
    const fsTitle = (document.getElementById('fs_title') || {}).value || '28';
    const fsSubheading = (document.getElementById('fs_subheading') || {}).value || '15';
    const fsDetails = (document.getElementById('fs_details') || {}).value || '16';
    const fsCta = (document.getElementById('fs_cta') || {}).value || '15';

    // Logo sizes
    const logoSize = (document.getElementById('logo_size') || {}).value || '60';
    const partnerLogoSize = (document.getElementById('partner_logo_size') || {}).value || '60';

    // Colors
    const textColor = getColor('color_text', '#FFFFFF');
    const iconColor = getColor('color_icon', '#FFFFFF');
    const ctaBg = getColor('color_cta_bg', '#FCBA30');
    const ctaTextColor = getColor('color_cta_text', '#00274C');

    // If nothing is filled in, show empty state
    if (!eventName && !location && !dates && !ctaText && !currentImageUrl && !currentLogoUrl && !currentPartnerLogoUrl) {
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

    // Build logo section (supports dual logos side-by-side)
    let logoHtml;
    const mainLogoImg = currentLogoUrl
        ? `<img src="${escapeHtml(currentLogoUrl)}" alt="Logo" style="max-height:${logoSize}px; max-width:280px; width:auto; height:auto; object-fit:contain;">`
        : '';
    const partnerLogoImg = currentPartnerLogoUrl
        ? `<img src="${escapeHtml(currentPartnerLogoUrl)}" alt="Partner Logo" style="max-height:${partnerLogoSize}px; max-width:280px; width:auto; height:auto; object-fit:contain;">`
        : '';

    if (mainLogoImg && partnerLogoImg) {
        // Both logos: side-by-side
        logoHtml = `<div style="display:flex; align-items:center; justify-content:center; gap:24px; margin-bottom:20px;">${mainLogoImg}${partnerLogoImg}</div>`;
    } else if (mainLogoImg) {
        logoHtml = `<div style="margin-bottom:20px;">${mainLogoImg}</div>`;
    } else if (partnerLogoImg) {
        logoHtml = `<div style="margin-bottom:20px;">${partnerLogoImg}</div>`;
    } else {
        logoHtml = `<div style="height:70px; width:200px; border:2px dashed rgba(255,255,255,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; color:rgba(255,255,255,0.4); font-size:12px;">Upload logo</div>`;
    }

    // Map pin SVG icon
    const pinIcon = `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" style="flex-shrink:0;">
        <path d="M7 0C3.13 0 0 3.13 0 7c0 4.87 6.25 10.5 6.52 10.74a.67.67 0 0 0 .96 0C7.75 17.5 14 11.87 14 7c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="${iconColor}"/>
    </svg>`;

    // Calendar SVG icon
    const calendarIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;">
        <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="${iconColor}" stroke-width="1.5" fill="none"/>
        <line x1="1" y1="6.5" x2="15" y2="6.5" stroke="${iconColor}" stroke-width="1.5"/>
        <line x1="5" y1="1" x2="5" y2="4" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="11" y1="1" x2="11" y2="4" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

    // Arrow icon for CTA
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

                <div style="font-size:${fsTitle}px; font-weight:800; color:${textColor}; line-height:1.2; margin-bottom:${subheading ? '8px' : '20px'}; text-transform:uppercase; letter-spacing:0.02em;">
                    ${escapeHtml(eventName) || '<span style="opacity:0.4;">Event Name</span>'}
                </div>

                ${subheading ? `
                <div style="font-size:${fsSubheading}px; font-weight:400; color:${textColor}; opacity:0.85; margin-bottom:20px; line-height:1.4;">
                    ${escapeHtml(subheading)}
                </div>` : ''}

                ${location ? `
                <div style="display:flex; align-items:center; gap:6px; color:${textColor}; font-size:${fsDetails}px; font-weight:500;">
                    ${pinIcon}
                    ${escapeHtml(location)}
                </div>` : ''}

                ${dates ? `
                <div style="display:flex; align-items:center; gap:6px; font-size:${fsDetails}px; font-weight:500; color:${textColor}; margin-top:8px;">
                    ${calendarIcon}
                    ${escapeHtml(dates)}
                </div>` : ''}

                ${ctaText ? `
                <div style="margin-top:28px;">
                    <div style="display:inline-flex; align-items:center; background:${ctaBg}; color:${ctaTextColor}; padding:12px 32px; border-radius:25px; font-size:${fsCta}px; font-weight:700;">
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
    // Clear search image selection
    document.querySelectorAll('.image-grid-item').forEach(item => item.classList.remove('selected'));
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
        document.getElementById('logo-size-control').style.display = '';
    };
    reader.readAsDataURL(file);
}

function clearLogo() {
    currentLogoUrl = '';
    document.getElementById('logo_upload').value = '';
    document.getElementById('logo-upload-area').style.display = '';
    document.getElementById('logo-file-selected').style.display = 'none';
    document.getElementById('logo-size-control').style.display = 'none';
    updatePreview();
}

// ── Partner Logo Upload ──
function handlePartnerLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        currentPartnerLogoUrl = ev.target.result;
        updatePreview();

        document.getElementById('partner-logo-upload-area').style.display = 'none';
        document.getElementById('partner-logo-file-selected').style.display = 'flex';
        document.getElementById('partner-logo-file-name').textContent = file.name;
        document.getElementById('partner-logo-size-control').style.display = '';
    };
    reader.readAsDataURL(file);
}

function clearPartnerLogo() {
    currentPartnerLogoUrl = '';
    document.getElementById('partner_logo_upload').value = '';
    document.getElementById('partner-logo-upload-area').style.display = '';
    document.getElementById('partner-logo-file-selected').style.display = 'none';
    document.getElementById('partner-logo-size-control').style.display = 'none';
    updatePreview();
}

// ── Image Search ──
async function searchImages() {
    const input = document.getElementById('image-search-input');
    const query = input.value.trim();
    if (!query) {
        showToast('Enter a search term', true);
        return;
    }

    const btn = document.getElementById('image-search-btn');
    const grid = document.getElementById('image-grid');
    const attribution = document.getElementById('image-attribution');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    grid.style.display = 'grid';
    grid.innerHTML = '<div class="image-grid-loading"><span class="spinner"></span> Searching...</div>';
    attribution.style.display = 'none';

    try {
        const resp = await fetch('/api/search-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        const data = await resp.json();

        if (data.error) {
            grid.innerHTML = `<div class="image-grid-loading">${escapeHtml(data.error)}</div>`;
            return;
        }

        if (!data.images || data.images.length === 0) {
            grid.innerHTML = '<div class="image-grid-loading">No images found. Try a different search.</div>';
            return;
        }

        grid.innerHTML = data.images.map(img =>
            `<div class="image-grid-item" onclick="selectSearchImage('${escapeHtml(img.full)}', this)" title="${escapeHtml(img.alt || img.photographer)}">
                <img src="${escapeHtml(img.thumb)}" alt="${escapeHtml(img.alt)}" loading="lazy">
                <span class="photographer">${escapeHtml(img.photographer)}</span>
            </div>`
        ).join('');
        attribution.style.display = '';
    } catch (err) {
        grid.innerHTML = '<div class="image-grid-loading">Failed to search images</div>';
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search`;
    }
}

function selectSearchImage(url, el) {
    // Update background image
    currentImageUrl = url;
    updatePreview();

    // Show selected state
    document.querySelectorAll('.image-grid-item').forEach(item => item.classList.remove('selected'));
    el.classList.add('selected');

    // Update file display
    document.getElementById('bg-upload-area').style.display = 'none';
    document.getElementById('bg-file-selected').style.display = 'flex';
    document.getElementById('bg-file-name').textContent = 'Stock photo from Pexels';

    showToast('Background image applied!');
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
    if (data.partner_logo_url && data.partner_logo_url.startsWith('data:')) {
        warnings.push('partner logo');
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
        subheading: document.getElementById('subheading').value.trim(),
        location: document.getElementById('location').value.trim(),
        dates: document.getElementById('dates').value.trim(),
        cta_text: document.getElementById('cta_text').value.trim(),
        image_url: currentImageUrl,
        logo_url: currentLogoUrl,
        partner_logo_url: currentPartnerLogoUrl,
        color_text: getColor('color_text', '#FFFFFF'),
        color_icon: getColor('color_icon', '#FFFFFF'),
        color_cta_bg: getColor('color_cta_bg', '#FCBA30'),
        color_cta_text: getColor('color_cta_text', '#00274C'),
        fs_title: (document.getElementById('fs_title') || {}).value || '28',
        fs_subheading: (document.getElementById('fs_subheading') || {}).value || '15',
        fs_details: (document.getElementById('fs_details') || {}).value || '16',
        fs_cta: (document.getElementById('fs_cta') || {}).value || '15',
        logo_size: (document.getElementById('logo_size') || {}).value || '60',
        partner_logo_size: (document.getElementById('partner_logo_size') || {}).value || '60',
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
