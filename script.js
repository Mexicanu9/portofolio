document.addEventListener('DOMContentLoaded', () => {
    // Helpers
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // API base: use the same host the page was loaded from, but on port 3000
    const API_BASE = (() => {
        const host = window.location.hostname || 'localhost';
        return `http://${host}:3000`;
    })();

    // =========================
    // Music player (audio + UI)
    // =========================
    const progress = $('#progress');
    const song = $('#song');
    const ctrlIcon = $('#ctrlIcon');
    const nextButton = $('#nextButton');
    const prevButton = $('#prevButton');
    const coverImg = $('#cover');
    const actions = $('.actions');
    const musicPlayer = $('.musicplayer');

    const playlist = [
        'media/test.mp3.mp3',
        'media/Mandi ft.Mikel Elmazi Fabio Ilir Tironsi Venesa.mp3',
        'media/Johny Romano E Mult E Greu Official Video.mp3'
    ];
    const images = ['media/guta.webp', 'media/vanesa.webp', 'media/jhonny.webp'];
    const titles = ['Prin Ploi Si Furtuni', 'Vanesa', 'E Mult E Greu'];
    let currentSongIndex = 0;

    function safe(fn) {
        try { fn(); } catch {}
    }

    if (song && progress) {
        song.addEventListener('loadedmetadata', () => {
            progress.max = song.duration || 0;
            progress.value = song.currentTime || 0;
        });

        // Smooth progress updates only while playing
        song.addEventListener('timeupdate', () => {
            if (!progress.max) progress.max = song.duration || 0;
            progress.value = song.currentTime || 0;
        });

        // Keep icon in sync on play/pause events
        song.addEventListener('play', () => {
            if (ctrlIcon) {
                ctrlIcon.classList.remove('fa-play');
                ctrlIcon.classList.add('fa-pause');
            }
        });
        song.addEventListener('pause', () => {
            if (ctrlIcon) {
                ctrlIcon.classList.remove('fa-pause');
                ctrlIcon.classList.add('fa-play');
            }
        });

        // Load a song without forcing autoplay unless requested
        function loadSong(index, { autoplay = false, preserveState = false } = {}) {
            const i = ((index % playlist.length) + playlist.length) % playlist.length;
            const wasPlaying = !song.paused;
            currentSongIndex = i;
            song.src = playlist[i];
            safe(() => { $('#cover').src = images[i]; });
            safe(() => { $('#songTitle').textContent = titles[i]; });
            song.load();
            const shouldPlay = preserveState ? wasPlaying : autoplay;
            if (shouldPlay) song.play().catch(() => {});
        }

        song.addEventListener('ended', () => {
            // Auto-advance when a track ends (user already chose to play)
            loadSong(currentSongIndex + 1, { autoplay: true });
        });

        if (nextButton) {
            // Keep current play/pause state on track change
            nextButton.addEventListener('click', () => loadSong(currentSongIndex + 1, { preserveState: true }));
        }
        if (prevButton) {
            // Keep current play/pause state on track change
            prevButton.addEventListener('click', () => loadSong(currentSongIndex - 1, { preserveState: true }));
        }

        // Seek without forcing playback; if it was playing, it keeps playing
        const seek = () => {
            if (song.duration) {
                song.currentTime = Number(progress.value) || 0;
            }
        };
        progress.addEventListener('change', seek);
        progress.addEventListener('input', seek);

        // Expose for HTML onclick
        window.playPause = () => {
            if (!song) return;
            if (song.paused) {
                song.play().catch(() => {});
            } else {
                song.pause();
            }
        };

        // Initial: load first song but do NOT autoplay
        loadSong(0, { autoplay: false });
    }

    // =========================
    // Music player width toggle
    // =========================
    let actionsVisible = true;
    let isNarrow = false;

    function updateMusicPlayerWidth() {
        if (!musicPlayer) return;
        const small = window.innerWidth < 750;
        // Keep original behavior; just simplify logic
        musicPlayer.style.width = isNarrow ? '100px' : small ? '90%' : '70%';
    }

    if (musicPlayer) {
        musicPlayer.style.transition = 'width 1000ms cubic-bezier(0.4,0,0.2,1)';
    }

    if (coverImg && actions && musicPlayer) {
        coverImg.addEventListener('click', () => {
            actionsVisible = !actionsVisible;

            if (actionsVisible) {
                // Expanding
                isNarrow = false;
                updateMusicPlayerWidth();

                // Show actions after transition (with fallback)
                let shown = false;
                const showActions = () => {
                    if (!shown) {
                        actions.style.display = 'flex';
                        shown = true;
                        musicPlayer.removeEventListener('transitionend', onEnd);
                    }
                };
                const onEnd = (e) => { if (e.propertyName === 'width') showActions(); };
                musicPlayer.addEventListener('transitionend', onEnd, { once: true });
                setTimeout(showActions, 400);
            } else {
                // Collapsing
                actions.style.display = 'none';
                isNarrow = true;
                updateMusicPlayerWidth();
            }
        });

        window.addEventListener('resize', updateMusicPlayerWidth, { passive: true });
        updateMusicPlayerWidth();
    }

    // =========================
    // Sidebar + nav active link
    // =========================
    const navbar = $('#navbar');
    const openButton = $('#open-sidebar-button');
    const navLinks = $$('.navlink');

    window.openSidebar = () => { if (navbar) navbar.classList.add('show'); };
    window.closeSidebar = () => { if (navbar) navbar.classList.remove('show'); };
    if (openButton) openButton.addEventListener('click', window.openSidebar);

    if (navLinks.length) {
        navLinks[0].classList.add('active-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // Check if it's an anchor link
                if (href && href.startsWith('#')) {
                    const targetId = href.substring(1);
                    const target = document.getElementById(targetId);
                    if (target && lenisMain) {
                        e.preventDefault();
                        // Use Lenis to scroll to the target
                        lenisMain.scrollTo(target, {
                            offset: 0,
                            duration: 2.0,
                            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                        });
                    }
                }
                navLinks.forEach(l => l.classList.remove('active-link'));
                link.classList.add('active-link');
                window.closeSidebar();
            });
        });
    }

    // =========================
    // Knowledge scroller arrows
    // =========================
    const rightButton = $('#right');
    const leftButton = $('#left');
    const knowledgeItem = $('.knowledge-container');
    const scrollAmount = 400;

    function lenisScrollBy(element, amount) {
        if (!element) return;
        const start = element.scrollLeft;
        const end = start + amount;
        const duration = 500;
        const easeInOut = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        let startTime = 0;

        function step(time) {
            if (!startTime) startTime = time;
            const p = Math.min((time - startTime) / duration, 1);
            const eased = easeInOut(p);
            element.scrollLeft = start + (end - start) * eased;
            if (p < 1) requestAnimationFrame(step);
            else updateButtonStates();
        }
        requestAnimationFrame(step);
    }

    function updateButtonStates() {
        if (!knowledgeItem || !leftButton || !rightButton) return;
        const atLeft = knowledgeItem.scrollLeft <= 0;
        const atRight = knowledgeItem.scrollLeft + knowledgeItem.clientWidth >= knowledgeItem.scrollWidth - 1;

        leftButton.classList.toggle('disabled', atLeft);
        rightButton.classList.toggle('disabled', atRight);
        leftButton.style.backgroundColor = atLeft ? '#ccc' : '';
        rightButton.style.backgroundColor = atRight ? '#ccc' : '';
    }

    if (rightButton) rightButton.addEventListener('click', () => lenisScrollBy(knowledgeItem, scrollAmount));
    if (leftButton) leftButton.addEventListener('click', () => lenisScrollBy(knowledgeItem, -scrollAmount));
    if (knowledgeItem) {
        knowledgeItem.addEventListener('scroll', updateButtonStates, { passive: true });
        updateButtonStates();
    }

    // =========================
    // Overlays + Lenis
    // =========================
    const htmlButton = $('#htmlbutton');
    const cssButton = $('#cssbutton');
    const javascriptButton = $('#javascriptbutton');

    const html = $('#html');
    const css = $('#css');
    const javascript = $('#javascript');
    const overlay1 = $('#overlay1');
    const expand = $('.expand');
    const expandcss = $('.expand-css');
    const temp = overlay1 ? overlay1.querySelector('.temp') : null;

    // Optional: Lenis guards
    const hasLenis = typeof Lenis !== 'undefined';
    const lenisMain = hasLenis
        ? new Lenis({
                wrapper: document.body,
                content: document.documentElement,
                smoothWheel: true,
                duration: 2.0,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            })
        : null;

    const lenisOverlay = hasLenis
        ? new Lenis({
                wrapper: $('.more') || document.body,
                content: $('.more') || document.body,
                smoothWheel: true,
                duration: 1.0,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            })
        : null;

    if (hasLenis) {
        function raf(time) {
            lenisMain && lenisMain.raf(time);
            lenisOverlay && lenisOverlay.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    function resetScrollPositions() {
        requestAnimationFrame(() => {
            if (temp) temp.scrollTop = 0;
            if (overlay1) overlay1.scrollTop = 0;
            if (expand) expand.scrollTop = 0;
        });
    }

    function openSection(sectionEl, opts = {}) {
        if (!sectionEl || !overlay1) return;
        sectionEl.style.display = 'flex';
        overlay1.style.display = 'flex';
        overlay1.style.position = 'fixed';
        if (opts.overflowY != null) overlay1.style.overflowY = opts.overflowY;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        if (lenisMain) lenisMain.stop();
        if (lenisOverlay) lenisOverlay.start();

        resetScrollPositions();
    }

    function closeSections() {
        [html, css, javascript].forEach(el => { if (el) el.style.display = 'none'; });
        if (overlay1) overlay1.style.display = 'none';

        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';

        if (lenisMain) lenisMain.start();
        if (lenisOverlay) lenisOverlay.stop();

        resetScrollPositions();
    }

    if (htmlButton) htmlButton.addEventListener('click', () => openSection(html));
    if (cssButton) {
        cssButton.addEventListener('click', () => {
            if (expandcss) expandcss.style.height = '230vh';
            openSection(css, { overflowY: '' });
        });
    }
    if (javascriptButton) javascriptButton.addEventListener('click', () => openSection(javascript, { overflowY: '' }));

    $$('.close-popup').forEach(btn => btn.addEventListener('click', closeSections));

    // =========================
    // Calendar + events (CRUD)
    // =========================
    const monthYear = $('#month-year');
    const daysContainer = $('#days');
    const prevMonthButton = $('#prev');
    const nextMonthButton = $('#next');
    const selectedDateP = $('#selectedDate');
    const addEventButton = $('.add_event');
    const eventWriteForm = $('.calendar-section .scheduel .event_holder .event .write_event');
    const eventsContainer = $('.calendar-section .scheduel .events');
    const editHeader = $('#edit');
    const eventTitleInput = $('.write_event input[type="text"]');
    const eventInfoTextarea = $('.write_event textarea');
    const saveButton = $('#saveButton');
    const cancelButton = $('#cancelButton');

    const months = [
        'January','February','March','April','May','June','July','August','September','October','November','December'
    ];

    let currentDate = new Date();
    const today = new Date();
    let selectedDayElement = null;
    let monthYearPicker = null;

    // Global app holder
    if (!window.calendarApp) window.calendarApp = {};
    const eventsData = {};
    window.calendarApp.eventsData = eventsData;

    // Inject styles once
    if (!$('#global-styles')) {
        const style = document.createElement('style');
        style.id = 'global-styles';
        style.textContent = `
            .has-event { position: relative; }
            .has-event::after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
                width: 60%;
                height: 2px;
                background-color: white;
                border-radius: 1px;
            }
            .today.has-event::after { background-color: #252525; }

            .event_item {
                overflow-wrap: anywhere;
                word-break: break-word;
                white-space: normal;
                min-height: 32px;
                box-sizing: border-box;
                transition: min-height 0.2s ease;
            }
            .event_item.text-wrapped { min-height: 48px; }
            .event_item h4 { margin: 0; line-height: 1.3; }

            * { scrollbar-width: thin; scrollbar-color: #f8d32e transparent; }
            *::-webkit-scrollbar { width: 5px; height: 5px; }
            *::-webkit-scrollbar-track { background: transparent; }
            *::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 20px; }
            *::-webkit-scrollbar-button {
                background-color: transparent;
                color: #ffffff;
                width: 0; height: 0; -ms-overflow-style: none;
            }
        `;
        document.head.appendChild(style);

        // Dynamic height adjust for event items
        (function () {
            function updateEventItemHeights(root = document) {
                const items = root.querySelectorAll('.calendar-section .scheduel .events .event_item h4');
                items.forEach(h4 => {
                    const item = h4.closest('.event_item');
                    if (!item) return;
                    const styles = getComputedStyle(h4);
                    let lineHeight = parseFloat(styles.lineHeight);
                    if (!lineHeight || Number.isNaN(lineHeight)) lineHeight = 18;

                    requestAnimationFrame(() => {
                        const lines = Math.max(1, Math.round(h4.scrollHeight / lineHeight));
                        const base = 40;
                        const extra = lines > 1 ? (lines - 1) * lineHeight : 0;
                        item.style.minHeight = Math.ceil(base + extra) + 'px';
                        item.classList.toggle('text-wrapped', lines > 1);
                    });
                });
            }

            function setupObservers() {
                if (!eventsContainer) return;
                const mo = new MutationObserver(() => updateEventItemHeights(eventsContainer));
                mo.observe(eventsContainer, { childList: true, subtree: true, characterData: true });

                if (window.ResizeObserver) {
                    const ro = new ResizeObserver(() => updateEventItemHeights(eventsContainer));
                    ro.observe(eventsContainer);
                }
                window.addEventListener('resize', () => updateEventItemHeights(eventsContainer), { passive: true });

                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => updateEventItemHeights(eventsContainer)).catch(() => {});
                }
                updateEventItemHeights(eventsContainer);
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setupObservers, { once: true });
            } else {
                setupObservers();
            }
        })();
    }

    function renderCalendar(date) {
        if (!daysContainer || !monthYear) return;
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = `${months[month]} ${year}`;
        daysContainer.innerHTML = '';

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = String(prevMonthLastDay - i + 1);
            dayDiv.classList.add('fade');
            daysContainer.appendChild(dayDiv);
        }

        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = String(i);
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }
            if (selectedDayElement && i === parseInt(selectedDayElement.textContent || '0', 10) &&
                    month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayDiv.classList.add('active-day');
            }

            const dateString = String(i).padStart(2, '0') + '-' + String(month + 1).padStart(2, '0') + '-' + year;
            if (eventsData[dateString] && eventsData[dateString].length > 0) {
                dayDiv.classList.add('has-event');
            }

            daysContainer.appendChild(dayDiv);
        }

        // Trailing days to complete the week row
        const nextMonthStartDay = (7 - new Date(year, month + 1, 0).getDay() - 1 + 7) % 7;
        for (let i = 1; i <= nextMonthStartDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = String(i);
            dayDiv.classList.add('fade');
            daysContainer.appendChild(dayDiv);
        }
    }

    window.calendarApp.renderCalendar = renderCalendar;

    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
    }
    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });
    }

    function showMonthPicker() {
        if (!monthYear) return;

        if (monthYearPicker) {
            monthYearPicker.remove();
            monthYearPicker = null;
            return;
        }

        monthYearPicker = document.createElement('div');
        Object.assign(monthYearPicker.style, {
            position: 'absolute',
            background: '#252525ff',
            border: '1px solid #111111',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: '1000',
            padding: '10px',
            display: 'flex',
            gap: '20px',
            borderRadius: '10px'
        });

        const rect = monthYear.getBoundingClientRect();
        monthYearPicker.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
        monthYearPicker.style.transform = 'translate(-50%, 0%)';
        monthYearPicker.style.top = (rect.bottom + window.scrollY) + 'px';

        const monthsList = document.createElement('div');
        Object.assign(monthsList.style, {
            display: 'flex', flexDirection: 'column', gap: '2px', borderRadius: '4px',
            maxHeight: '180px', overflowY: 'auto', minWidth: '70px'
        });
        months.map(m => m.substring(0, 3)).forEach((m, i) => {
            const btn = document.createElement('button');
            btn.textContent = m;
            Object.assign(btn.style, {
                background: i === currentDate.getMonth() ? '#f8d32e' : '#453f26',
                color: '#252525', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px'
            });
            btn.onclick = () => {
                currentDate.setMonth(i);
                renderCalendar(currentDate);
                monthYearPicker.remove();
                monthYearPicker = null;
            };
            monthsList.appendChild(btn);
        });

        const yearsList = document.createElement('div');
        Object.assign(yearsList.style, {
            display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '4px',
            maxHeight: '180px', overflowY: 'auto', minWidth: '70px'
        });

        const startYear = currentDate.getFullYear() - 50;
        for (let y = startYear; y < startYear + 100; y++) {
            const btn = document.createElement('button');
            btn.textContent = y;
            Object.assign(btn.style, {
                background: y === currentDate.getFullYear() ? '#f8d32e' : '#453f26',
                color: '#252525', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px'
            });
            btn.onclick = () => {
                currentDate.setFullYear(y);
                renderCalendar(currentDate);
                monthYearPicker.remove();
                monthYearPicker = null;
            };
            yearsList.appendChild(btn);
        }

        monthYearPicker.appendChild(monthsList);
        monthYearPicker.appendChild(yearsList);
        document.body.appendChild(monthYearPicker);

        setTimeout(() => {
            const currentMonthButton = monthsList.children[currentDate.getMonth()];
            if (currentMonthButton) currentMonthButton.scrollIntoView({ block: 'center' });

            const yearIndex = currentDate.getFullYear() - startYear;
            const currentYearButton = yearsList.children[yearIndex];
            if (currentYearButton) currentYearButton.scrollIntoView({ block: 'center' });

            function outside(e) {
                if (monthYearPicker && !monthYearPicker.contains(e.target) && e.target !== monthYear) {
                    monthYearPicker.remove();
                    monthYearPicker = null;
                    document.removeEventListener('mousedown', outside);
                }
            }
            document.addEventListener('mousedown', outside);
        }, 0);
    }
    if (monthYear) monthYear.addEventListener('click', showMonthPicker);

    // Responsive: ensure events container is scrollable with a 120px max height on small screens
    (() => {
        if (document.getElementById('events-responsive-styles')) return;
        const style = document.createElement('style');
        style.id = 'events-responsive-styles';
        style.textContent = `
            @media (max-width: 1051px) {
                .calendar-section .scheduel .events {
                    max-height: 45vh !important;
                    overflow-y: auto !important;
                    -webkit-overflow-scrolling: touch;
                }
            }
        `;
        document.head.appendChild(style);
    })();

    if (daysContainer) {
        daysContainer.addEventListener('click', (e) => {
            if (!(e.target instanceof Element)) return;
            if (e.target.tagName !== 'DIV' || !e.target.textContent) return;

            const day = parseInt(e.target.textContent, 10);
            let selectedDate;
            let monthChanged = false;

            if (e.target.classList.contains('fade')) {
                const dayElements = Array.from(daysContainer.children);
                const clickedIndex = dayElements.indexOf(e.target);
                const firstDayOfMonthIndex = dayElements.findIndex(el => !el.classList.contains('fade'));

                if (clickedIndex < firstDayOfMonthIndex) {
                    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
                } else {
                    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
                }
                currentDate = new Date(selectedDate);
                monthChanged = true;
            } else {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            }

            const formattedDate = String(selectedDate.getDate()).padStart(2, '0') + '-' +
                                                        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
                                                        selectedDate.getFullYear();

            if (selectedDateP) selectedDateP.textContent = formattedDate;

            if (selectedDayElement) selectedDayElement.classList.remove('active-day');

            if (monthChanged) {
                renderCalendar(currentDate);
                const newDayElements = Array.from(daysContainer.children);
                const targetDayEl = newDayElements.find(el =>
                    !el.classList.contains('fade') && parseInt(el.textContent || '0', 10) === day
                );
                if (targetDayEl) {
                    targetDayEl.classList.add('active-day');
                    selectedDayElement = targetDayEl;
                }
            } else {
                e.target.classList.add('active-day');
                selectedDayElement = e.target;
            }

            // Show events for selected day
            if (selectedDateP && selectedDateP.textContent) {
                displayEventsForDate(selectedDateP.textContent);
            }
        });
    }
    // Smooth rotation for the add event button
    if (addEventButton) {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const transitionSpec = prefersReducedMotion ? 'transform 0ms linear' : 'transform 250ms cubic-bezier(0.4,0,0.2,1)';
        const existing = addEventButton.style.transition || '';

        if (!existing.includes('transform')) {
            addEventButton.style.transition = existing ? `${existing}, ${transitionSpec}` : transitionSpec;
        }
        addEventButton.style.transformOrigin = 'center';
        addEventButton.style.willChange = 'transform';
    }
    // Creative unfold animation for the .write_event form (no sparkles)
    (() => {
        if (!eventWriteForm) return;

        // Inject minimal styles once
        if (!document.getElementById('write-event-anim-css')) {
            const style = document.createElement('style');
            style.id = 'write-event-anim-css';
            style.textContent = `
                .write_event { transform-origin: right center; backface-visibility: hidden; }
                @media (prefers-reduced-motion: reduce) {
                    .write_event { animation: none !important; transition: none !important; }
                }
            `;
            document.head.appendChild(style);
        }

        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const canWA = typeof eventWriteForm.animate === 'function' && !prefersReduced;

        // Prepare element for transforms
        try {
            const cs = getComputedStyle(eventWriteForm);
            if (cs.position === 'static') eventWriteForm.style.position = 'relative';
            eventWriteForm.style.overflow = eventWriteForm.style.overflow || 'visible';
            eventWriteForm.style.willChange = 'transform, opacity';
        } catch {}

        function animateOpen() {
            if (!canWA) return;
            eventWriteForm.animate(
                [
                    { opacity: 0, transform: 'perspective(1000px) rotateY(-14deg) translateX(24px) scale(0.96)', filter: 'blur(1px)' },
                    { opacity: 1, transform: 'perspective(1000px) rotateY(0deg) translateX(0) scale(1.02)', filter: 'blur(0)', offset: 0.6 },
                    { opacity: 1, transform: 'perspective(1000px) rotateY(0deg) translateX(0) scale(1)', filter: 'blur(0)' }
                ],
                { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' }
            );
        }

        function animateClose() {
            if (!canWA) return;
            eventWriteForm.animate(
                [
                    { opacity: 1, transform: 'perspective(1000px) rotateY(0deg) translateX(0) scale(1)', filter: 'blur(0)' },
                    { opacity: 0, transform: 'perspective(1000px) rotateY(8deg) translateX(12px) scale(0.98)', filter: 'blur(0.5px)' }
                ],
                { duration: 180, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
            );
        }

        // Watch the form's style changes driven by existing toggle code
        let prev = { display: eventWriteForm.style.display || '', opacity: eventWriteForm.style.opacity || '' };
        const mo = new MutationObserver(() => {
            const now = { display: eventWriteForm.style.display || '', opacity: eventWriteForm.style.opacity || '' };

            // Opening when display goes to block
            if (prev.display !== 'block' && now.display === 'block') {
                animateOpen();
            }
            // Closing when opacity goes to 0 while still visible
            if (prev.opacity !== '0' && now.opacity === '0' && now.display !== 'none') {
                animateClose();
            }
            prev = now;
        });
        mo.observe(eventWriteForm, { attributes: true, attributeFilter: ['style'] });
    })();
    // Events UI
    function toggleEventForm(show) {
        if (!eventWriteForm || !eventsContainer || !addEventButton) return;
        const isFormVisible = eventWriteForm.style.display === 'block';

        if (show && !isFormVisible) {
            eventsContainer.style.opacity = '0';
            setTimeout(() => {
                eventsContainer.style.display = 'none';
                eventWriteForm.style.display = 'block';
                requestAnimationFrame(() => (eventWriteForm.style.opacity = '1'));
            }, 200);
            addEventButton.style.transform = 'rotate(45deg)';
        } else if (!show && isFormVisible) {
            eventWriteForm.style.opacity = '0';
            setTimeout(() => {
                eventWriteForm.style.display = 'none';
                eventsContainer.style.display = 'flex';
                requestAnimationFrame(() => (eventsContainer.style.opacity = '1'));
            }, 200);
            addEventButton.style.transform = 'rotate(0deg)';
        }
    }
    function openEventForm() { toggleEventForm(true); }
    function closeEventForm() { toggleEventForm(false); }

    let editingEvent = null;

    function displayEventsForDate(date) {
        if (!eventsContainer) return;
        eventsContainer.innerHTML = '';
        const eventsForDay = eventsData[date] || [];

        if (eventsForDay.length === 0) {
            Object.assign(eventsContainer.style, {
                justifyContent: 'center', flexDirection: 'row', overflowY: 'hidden'
            });
            const noEventsP = document.createElement('p');
            noEventsP.textContent = 'No events for this day';
            eventsContainer.appendChild(noEventsP);
            return;
        }

        Object.assign(eventsContainer.style, {
            justifyContent: 'flex-start', flexDirection: 'column', overflowY: 'auto'
        });
        // Fancy entry + hover animation for event cards (injected once)
        (() => {
            if (document.getElementById('event-animations-styles')) return;
            const style = document.createElement('style');
            style.id = 'event-animations-styles';
            style.textContent = `
        @keyframes eventCardIn {
            0%   { opacity: 0; transform: translateY(14px) scale(0.96) rotateX(4deg); filter: blur(1px); }
            60%  { opacity: 1; transform: translateY(0) scale(1.02) rotateX(0deg); filter: blur(0); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .calendar-section .scheduel .events .event_item {
            animation: eventCardIn 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
            transform-origin: top center;
            will-change: transform, opacity;
            transition: background 0.1s ease, transform 160ms ease !important;
        }
        .calendar-section .scheduel .events .event_item:hover {
            transform: translateY(-3px) scale(1.01);
        }
        .calendar-section .scheduel .events .event_item:active {
            transform: translateY(0) scale(0.995);
        }

        /* Staggered delays for a "cascade" reveal */
        .calendar-section .scheduel .events .event_item:nth-child(1)  { animation-delay: 0ms; }
        .calendar-section .scheduel .events .event_item:nth-child(2)  { animation-delay: 50ms; }
        .calendar-section .scheduel .events .event_item:nth-child(3)  { animation-delay: 100ms; }
        .calendar-section .scheduel .events .event_item:nth-child(4)  { animation-delay: 150ms; }
        .calendar-section .scheduel .events .event_item:nth-child(5)  { animation-delay: 200ms; }
        .calendar-section .scheduel .events .event_item:nth-child(6)  { animation-delay: 250ms; }
        .calendar-section .scheduel .events .event_item:nth-child(7)  { animation-delay: 300ms; }
        .calendar-section .scheduel .events .event_item:nth-child(8)  { animation-delay: 350ms; }
        .calendar-section .scheduel .events .event_item:nth-child(9)  { animation-delay: 400ms; }
        .calendar-section .scheduel .events .event_item:nth-child(10) { animation-delay: 450ms; }
        .calendar-section .scheduel .events .event_item:nth-child(11) { animation-delay: 500ms; }
        .calendar-section .scheduel .events .event_item:nth-child(12) { animation-delay: 550ms; }

        @media (prefers-reduced-motion: reduce) {
            .calendar-section .scheduel .events .event_item {
                animation: none;
                transition: none !important;
            }
        }
        `;
            document.head.appendChild(style);
        })();
        eventsForDay.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event_item');
            Object.assign(eventDiv.style, {
                background: '#333', padding: '10px 15px', borderRadius: '4px',
                marginBottom: '10px', cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'background 0.1s ease',
                width: '100%'
            });

            const titleEl = document.createElement('h4');
            titleEl.textContent = event.title;
            titleEl.style.margin = '0';
            titleEl.style.color = '#f8d32e';

            eventDiv.appendChild(titleEl);
            eventsContainer.appendChild(eventDiv);

            eventDiv.addEventListener('click', () => {
                editingEvent = event;
                if (eventTitleInput) eventTitleInput.value = event.title || '';
                if (eventInfoTextarea) eventInfoTextarea.value = event.info || '';
                if (cancelButton) cancelButton.style.display = 'block';
                if (editHeader) editHeader.textContent = 'Edit event:';
                if (saveButton) saveButton.textContent = 'Change event';
                openEventForm();
            });
        });
    }

    async function loadEvents() {
        try {
            const response = await fetch(`${API_BASE}/events`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const events = await response.json();

            Object.keys(eventsData).forEach(k => delete eventsData[k]);
            events.forEach(event => {
                if (event.date && event.title) {
                    if (!eventsData[event.date]) eventsData[event.date] = [];
                    eventsData[event.date].push(event);
                }
            });

            renderCalendar(currentDate);
            if (selectedDateP && selectedDateP.textContent) {
                displayEventsForDate(selectedDateP.textContent);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        }
    }

    if (addEventButton) {
        addEventButton.addEventListener('click', () => {
            const isFormVisible = eventWriteForm && eventWriteForm.style.display === 'block';
            if (isFormVisible) {
                closeEventForm();
            } else {
                editingEvent = null;
                if (eventTitleInput) eventTitleInput.value = '';
                if (eventInfoTextarea) eventInfoTextarea.value = '';
                if (cancelButton) cancelButton.style.display = 'none';
                if (editHeader) editHeader.textContent = 'Add Event:';
                if (saveButton) saveButton.textContent = 'Add Event';
                openEventForm();
            }
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            const eventTitle = (eventTitleInput?.value || '').trim();
            const eventInfo = (eventInfoTextarea?.value || '').trim();
            const selectedDate = selectedDateP?.textContent || '';

            if (!eventTitle) {
                alert('Event title is required.');
                return;
            }
            if (!selectedDate) {
                alert('Select a date first.');
                return;
            }

            const eventData = { date: selectedDate, title: eventTitle, info: eventInfo };
            let url = `${API_BASE}/events`;
            let method = 'POST';
            if (editingEvent) {
                url += `/${editingEvent.id}`;
                method = 'PUT';
            }

            try {
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }
                await loadEvents();
                closeEventForm();
            } catch (err) {
                console.error('Error saving event:', err);
                alert('Failed to save event.');
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', async () => {
            if (editingEvent && confirm('Are you sure you want to delete this event?')) {
                try {
                    const response = await fetch(`${API_BASE}/events/${editingEvent.id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    await loadEvents();
                } catch (err) {
                    console.error('Error deleting event:', err);
                    alert('Failed to delete event.');
                }
            }
            closeEventForm();
            editingEvent = null;
        });
    }

    if (daysContainer) {
        const observer = new MutationObserver(() => {
            const activeDay = daysContainer.querySelector('.active-day');
            if (activeDay && selectedDateP && selectedDateP.textContent) {
                displayEventsForDate(selectedDateP.textContent);
            }
        });
        observer.observe(daysContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

        // Initial calendar render and select today
        renderCalendar(currentDate);
        if (daysContainer) {
            const todayEl = daysContainer.querySelector('.today');
            if (todayEl) todayEl.click();
        }
    
        // Initial load of events
        loadEvents();
    });

function sendMail(event){
    // Always prevent default form submission (even if called via onclick without passing event)
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    } else {
        // Fallback: prevent the imminent form submission if triggered by a submit button without event
        const activeEl = document.activeElement;
        const form = (activeEl && activeEl.form) || document.querySelector('form');
        if (form) {
            form.addEventListener('submit', e => e.preventDefault(), { once: true });
        }
    }

    const nameEl = document.getElementById("inTouchName");
    const emailEl = document.getElementById("inTouchEmail");

    const parms = {
        name: nameEl ? nameEl.value.trim() : "",
        emailAddress: emailEl ? emailEl.value.trim() : "",
    };

    if (!parms.name || !parms.emailAddress) {
        alert("Please fill in both name and email before sending.");
        return false;
    }

    if (typeof emailjs === "undefined" || !emailjs.send) {
        console.error("EmailJS library not loaded.");
        alert("Email service is not available right now.");
        return false;
    }

    // Optional init (replace with your actual public key if needed)
    if (!window._emailjsInitialized && emailjs.init) {
        try {
            emailjs.init("wWYe2fe1jnUlRqjFA"); // Using the key from your HTML
            window._emailjsInitialized = true;
        } catch (e) {
            console.warn("EmailJS init failed (may already be initialized):", e);
        }
    }

    emailjs
        .send("service_hyew6i8", "template_tef4ed5", parms)
        .then(() => {
            alert("Email Sent!");
        })
        .catch(err => {
            console.error("Email sending failed:", err);
            alert("Failed to send email.");
        });

    return false; // Ensure no navigation
}

// Attach submit handler once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm') || document.querySelector('form[data-emailjs]');
    if (contactForm && !contactForm._emailHandlerAttached) {
        contactForm.addEventListener('submit', sendMail);
        contactForm._emailHandlerAttached = true;
    }
});