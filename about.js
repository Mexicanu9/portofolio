const logoHome = document.querySelector('.logoHome')

if (logoHome) logoHome.addEventListener('click', () => window.location.href = 'index.html');

const targets = [...document.querySelectorAll('.advanced')];
const toggleBtn = document.querySelector('.closeOpen');
const mq = window.matchMedia('(max-width: 500px)');
let isOpen = false;

function ensureTransition(el) {
    if (el.dataset.animInit) return;
    el.style.transition = 'opacity 300ms ease, transform 500ms ease';
    el.style.willChange = 'opacity, transform';
    el.dataset.animInit = '1';
}

function showEl(el) {
    ensureTransition(el);
    if (getComputedStyle(el).display === 'none') {
        el.style.display = 'flex';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-8px)';
        el.style.pointerEvents = 'none';
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.pointerEvents = '';
        });
    } else {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.pointerEvents = '';
    }
}

function hideEl(el, immediate = false) {
    ensureTransition(el);
    if (el.__onEnd) {
        el.removeEventListener('transitionend', el.__onEnd);
        el.__onEnd = null;
    }
    if (immediate) {
        el.style.display = 'none';
        el.style.opacity = '';
        el.style.transform = '';
        el.style.pointerEvents = '';
        return;
    }
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.pointerEvents = 'none';
    el.__onEnd = (e) => {
        if (e.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', el.__onEnd);
        el.__onEnd = null;
        if (!isOpen && mq.matches) el.style.display = 'none';
    };
    el.addEventListener('transitionend', el.__onEnd);
}

let didInit = false;

function applyVisibility() {
    if (mq.matches) {
        if (isOpen) {
            targets.forEach(showEl);
        } else {
            targets.forEach(el => hideEl(el, !didInit));
        }
    } else {
        targets.forEach(el => {
            if (el.__onEnd) {
                el.removeEventListener('transitionend', el.__onEnd);
                el.__onEnd = null;
            }
            el.style.transition = '';
            el.style.willChange = '';
            el.style.display = '';
            el.style.opacity = '';
            el.style.transform = '';
            el.style.pointerEvents = '';
        });
    }
    didInit = true;
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        if (!mq.matches) return;
        isOpen = !isOpen;
        applyVisibility();
    });
}

(mq.addEventListener || mq.addListener).call(mq, 'change', applyVisibility);
applyVisibility();

let iconMenu = document.querySelector('.bodymovinanim');

if (iconMenu) {
    let animationMenu = lottie.loadAnimation({
        container: iconMenu,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: "menuV2.json"
    });

    // Set animation speed (higher number = faster)
    animationMenu.setSpeed(2.5);

    // Make the animation white
    animationMenu.addEventListener('DOMLoaded', function() {
        const svgElement = iconMenu.querySelector('svg');
        if (svgElement) {
            // Set all stroke colors to white
            const strokes = svgElement.querySelectorAll('[stroke]');
            strokes.forEach(element => {
                element.setAttribute('stroke', 'white');
            });
            
            // Set all fill colors to white if any
            const fills = svgElement.querySelectorAll('[fill]:not([fill="none"])');
            fills.forEach(element => {
                element.setAttribute('fill', 'white');
            });
        }
    });

    var directionMenu = 1;
    iconMenu.addEventListener('click', (e) => {
        animationMenu.setDirection(directionMenu);
        animationMenu.play();
        directionMenu = -directionMenu;
    });
}
const mytitle = document.querySelector('.title');

// Create an observer that will run a function whenever the element's size changes
const observer = new ResizeObserver(entries => {
  // We only have one element being observed
  for (let entry of entries) {
    const height = entry.contentRect.height;
    console.log(`Element height changed to: ${height}px`);

    // Set the CSS custom property with the new height
    mytitle.style.setProperty('--title-height', `${height}px`);
  }
});
const myinfo = document.querySelector('.info');

// Create an observer that will run a function whenever the element's size changes
const observer1 = new ResizeObserver(entries => {
  // We only have one element being observed
  for (let entry of entries) {
    const height = entry.contentRect.height;
    console.log(`Element height changed to: ${height}px`);

    // Set the CSS custom property with the new height
    myinfo.style.setProperty('--info-height', `${height}px`);
  }
});
function setViewportHeight() {
  // 1. Get the viewport height
  let vh = window.innerHeight;

  // 2. Set the value in the --viewport-height custom property on the root element
  document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
}

// Run the function once on page load
setViewportHeight();

// Run the function again whenever the window is resized
window.addEventListener('resize', setViewportHeight);
function setPartialViewportHeight() {
  // 1. Calculate 20% of the viewport height
  let vh_20 = window.innerHeight * 0.20;

  // 2. Set the value in the --viewport-height-20 custom property
  document.documentElement.style.setProperty('--viewport-height-20', `${vh_20}px`);
}

// Run the function once on page load
setPartialViewportHeight();

// Run the function again whenever the window is resized
window.addEventListener('resize', setPartialViewportHeight);

// Activate Lenis smooth scrolling (faster)
(() => {
    const LenisCtor = (typeof window !== 'undefined' && window.Lenis) ? window.Lenis : null;
    if (!LenisCtor) return;

    let lenis = null;
    let rafId = 0;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shouldEnable = () => window.innerWidth >= 550 && !prefersReduced.matches;

    function mountLenis() {
        if (lenis) return;
        lenis = new LenisCtor({
            duration: 2.0,
            smoothWheel: true,
            smoothTouch: true,
            wheelMultiplier: 1.6,
            touchMultiplier: 1.1,
            // legacy 0.x option (ignored by v1, speeds up older builds)
            lerp: 0.24
        });
        window.lenis = lenis;
    }

    function start() {
        if (!lenis || rafId) return;
        lenis.start?.();
        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
    }

    function stop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        if (lenis) lenis.stop?.();
    }

    function update() {
        if (shouldEnable()) {
            mountLenis();
            start();
        } else {
            stop();
        }
    }

    if (typeof prefersReduced.addEventListener === 'function') {
        prefersReduced.addEventListener('change', update);
    } else {
        prefersReduced.onchange = update;
    }
    window.addEventListener('resize', update, { passive: true });

    update();

    // Handle anchor links with Lenis scrolling
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);

        if (target && lenis) {
            e.preventDefault();
            // Use Lenis to scroll to the target element
            lenis.scrollTo(target, {
                offset: 0,
                duration: 2.0,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
})();

const track = document.getElementById("slider");

const handleOnDown = (e) => 
    track.dataset.mouseDownAt = e.clientX;

const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
}

const handleOnMove = (e) => {
    if (track.dataset.mouseDownAt === "0") return;

    const mouseDelta =
        parseFloat(track.dataset.mouseDownAt) - e.clientX,
        maxDelta = window.innerWidth;

    const percentage = (mouseDelta / maxDelta) * -100;
    const prev = parseFloat(track.dataset.prevPercentage) || 0;
    const nextPercentageUnconstrained = prev + percentage;

    // Calculate max scroll based on actual content and extend on small screens
    const container = track.parentElement || document.body;
    const contentWidth = track.scrollWidth || 0;
    const containerWidth = container.clientWidth || window.innerWidth;

    let maxScroll = 0; // negative value (how far left we can translate)
    if (contentWidth > containerWidth) {
        const needed = ((contentWidth - containerWidth) / contentWidth) * 100; // positive percent
        const extra = window.innerWidth < 550 ? 6 : 3; // extend more on small screens
        maxScroll = -(needed + extra);
        if (maxScroll < -100) maxScroll = -100; // hard cap
    }

    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), maxScroll);

    track.dataset.percentage = nextPercentage;

    track.animate({
        transform: `translateX(${nextPercentage}%)`
    }, { duration: 1200, fill: "forwards" });
}

window.onmousedown = (e) => handleOnDown(e);

window.ontouchstart = (e) => handleOnDown(e.touches[0]);

window.onmouseup = (e) => handleOnUp(e);

window.ontouchend = (e) => handleOnUp(e.touches[0]);

window.onmousemove = (e) => handleOnMove(e);

window.ontouchmove = (e) => handleOnMove(e.touches[0]);


/* Move the `.circle` along the `.line` so it sits beside the active `.box` elements */
(function(){
    const line = document.querySelector('.studying .line');
    const circle = document.querySelector('.studying .line .circle');
    const boxes = Array.from(document.querySelectorAll('.studying .box, .studying .box1, .studying .box2'));
    if (!line || !circle || boxes.length === 0) return;

    /**
     * CUSTOMIZE THIS VALUE: How early the circle moves to the next box
     * -200 = circle moves 200px BEFORE the box enters viewport (earlier)
     *    0 = circle moves when box is at viewport center
     *  200 = circle moves 200px AFTER the box enters viewport (later)
     * Adjust to your liking!
     */
    const CIRCLE_OFFSET = -150; // decrease (more negative) to move earlier, increase to move later

    function moveCircleToCenter(){
        const lineRect = line.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;

        // Position circle at the center of the viewport
        const topRelative = viewportCenter - lineRect.top - (circle.offsetHeight / 2);

        // clamp inside line bounds
        const clamped = Math.max(0, Math.min(lineRect.height - circle.offsetHeight, topRelative));
        circle.style.top = clamped + 'px';
    }

    // continuous animation frame loop to sync with Lenis and all animations
    let rafId = null;
    const animate = () => {
        moveCircleToCenter();
        rafId = requestAnimationFrame(animate);
    };

    // start the continuous loop
    rafId = requestAnimationFrame(animate);

})();

const triggers = document.querySelectorAll('.step_trigger');
const contents = document.querySelectorAll('.content');

const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const index = entry.target.dataset.target;
        const content = contents[index];

        if (entry.isIntersecting) {
            // New card becomes active
            content.classList.add('active');
            content.classList.remove('exit');
        } else {
            // Card leaves
            if (entry.boundingClientRect.top < 0) {
                // It moved UP: set to exit state
                content.classList.remove('active');
                content.classList.add('exit');
            } else {
                // It moved DOWN: reset unless it's the first card
                if (!content.classList.contains('is-first')) {
                    content.classList.remove('active', 'exit');
                }
            }
        }
    });
}, {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger exactly at the screen center
    threshold: 0
});

triggers.forEach(trigger => observer2.observe(trigger));



/**
 * WORLD SHOW - FINAL MAP CONTROLLER
 * Logic: Blank start, unique labels per point, and centered scrollytelling.
 * Variables: triggers1, contents1, observer3
 */

// 1. DATA CONFIGURATION
// labels are arrays to allow unique names for Point A and Point B
const eventLocations = {
    0: { 
        name: "Cambridge to Bletchley", 
        points: [[52.2053, 0.1218], [51.9977, -0.7407]], 
        zoom: 8, 
        labels: ["Cambridge University", "Bletchley Park"] 
    },
    1: { 
        name: "Philadelphia", 
        points: [[39.9522, -75.1932]], 
        zoom: 12, 
        labels: ["University of Pennsylvania"] 
    },
    2: { 
        name: "Harvard to Philly", 
        points: [[42.3770, -71.1167], [39.9522, -75.1632]], 
        zoom: 7, 
        labels: ["Harvard University", "UNIVAC Lab"] 
    },
    3: { 
        name: "MIT to Houston", 
        points: [[42.3601, -71.0942], [29.5606, -95.0848]], 
        zoom: 4, 
        labels: ["MIT (Cambridge)", "NASA Mission Control"] 
    },
    4: { 
        name: "Palo Alto", 
        points: [[37.4027, -122.1483]], 
        zoom: 11, 
        labels: ["Xerox PARC"] 
    },
    5: { 
        name: "Geneva", 
        points: [[46.2330, 6.0557]], 
        zoom: 10, 
        labels: ["CERN (The Birth of the Web)"] 
    }
};

// 2. MAP INITIALIZATION
// attributionControl: false removes the Leaflet logo/credits
const map = L.map('world-map', { 
    zoomControl: false,
    attributionControl: false, 
    fadeAnimation: true,
    markerZoomAnimation: true,
    inertia: true
}).setView([20, 0], 2);

// Optimized Tile Layer for dark theme and performance (prevents white flashes)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    updateWhenIdle: false, 
    keepBuffer: 15,        
    noWrap: true
}).addTo(map);

// Groups to manage markers and lines independently
let currentMarkers = L.layerGroup().addTo(map);
let currentPath = L.layerGroup().addTo(map);

// 3. ZOOM-BASED LABEL HANDLER
map.on('zoomend', function() {
    const currentZoom = map.getZoom();
    currentMarkers.eachLayer(function(layer) {
        if (currentZoom >= 4) { 
            layer.openTooltip();
        } else {
            layer.closeTooltip();
        }
    });
});

// 4. SCROLLYTELLING LOGIC (observer3)
const triggers1 = document.querySelectorAll('.step_trigger');
const contents1 = document.querySelectorAll('.content');

const observer3 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const target = entry.target.dataset.target;
        
        if (entry.isIntersecting) {
            
            // --- BLANK START LOGIC ---
            if (target === "blank") {
                contents1.forEach(c => c.classList.remove('active', 'exit'));
                currentMarkers.clearLayers();
                currentPath.clearLayers();
                map.flyTo([20, 0], 2, { animate: true, duration: 2 });
                return; 
            }

            const index = parseInt(target);
            const currentContent = contents1[index];

            // A. Handle Card Transitions (Forward & Backward)
            contents1.forEach((c, i) => {
                c.classList.remove('active');
                if (i < index) {
                    c.classList.add('exit');
                } else {
                    c.classList.remove('exit');
                }
            });

            currentContent.classList.add('active');
            currentContent.classList.remove('exit');

            // B. Map Animation
            currentMarkers.clearLayers();
            currentPath.clearLayers();

            const data = eventLocations[index];
            if (data) {
                // If there are 2 locations, make sure both are clearly in view
                if (data.points.length > 1) {
                    map.flyToBounds(data.points, {
                        padding: [50, 50],
                        duration: 2.5,
                        easeLinearity: 0.1
                    });
                } else {
                    map.flyTo(data.points[0], data.zoom, {
                        animate: true,
                        duration: 2.5,
                        easeLinearity: 0.1
                    });
                }

                // C. Add unique markers and labels after delay
                setTimeout(() => {
                    data.points.forEach((p, i) => {
                        const specificLabel = data.labels[i] || data.labels[0];
                        
                        const marker = L.marker(p, {
                            icon: L.divIcon({ className: 'custom-marker', iconSize: [12, 12] })
                        }).bindTooltip(specificLabel, { 
                            direction: 'top', 
                            className: 'map-label',
                            offset: [0, -10]
                        }).addTo(currentMarkers);
                        
                        // Force open tooltips if zoom is appropriate
                        if(map.getZoom() >= 4) marker.openTooltip();
                    });

                    // D. Draw Path if there are multiple locations
                    if (data.points.length > 1) {
                        L.polyline(data.points, { 
                            color: '#3498db', 
                            weight: 3, 
                            dashArray: '5, 10',
                            opacity: 0.8 
                        }).addTo(currentPath);
                    }
                }, 400); 
            }
        }
    });
}, {
    rootMargin: '-50% 0px -50% 0px', // Exact center-line trigger
    threshold: 0
});

// Start the observer
triggers1.forEach(t => observer3.observe(t));

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const suggestionsBox = document.getElementById('suggestions');

// 1. Translator for Weather Codes (WMO)
const weatherCodes = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime Fog",
    51: "Light Drizzle", 53:"Moderate Drizzle", 55:"Dense Drizzle", 56:"Light Freezing Drizzle", 57:"Dense Freezing Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain", 66: "Light Freezing Rain", 67: "Heavy Freezing Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers", 85:"Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm Slight", 96: "Thunderstorm Moderate", 99: "Thunderstorm With Slight and Heavy Hail"
};
const weatherVideos = {
    0: "about_vids/clear.mp4", 1: "about_vids/clear.mp4", 2: "about_vids/clouds.mp4", 3: "about_vids/overcast.mp4",
    45: "about_vids/overcast.mp4", 48: "about_vids/overcast.mp4",
    51: "about_vids/rain.mp4", 53: "about_vids/rain.mp4", 55: "about_vids/rain.mp4", 56: "about_vids/rain.mp4", 57: "about_vids/rain.mp4",
    61: "about_vids/rain.mp4", 63: "about_vids/rain.mp4", 65: "about_vids/rain.mp4", 66: "about_vids/rain.mp4", 67: "about_vids/rain.mp4",
    // Snow Logic
    71: "about_vids/snow.mp4", 73: "about_vids/snow.mp4", 75: "about_vids/snow.mp4", 77: "about_vids/snow.mp4",
    80: "about_vids/rain.mp4", 81: "about_vids/rain.mp4", 82: "about_vids/rain.mp4",
    85: "about_vids/snow.mp4", 86: "about_vids/snow.mp4",
    95: "about_vids/thunder.mp4", 96: "about_vids/thunder.mp4", 99: "about_vids/thunder.mp4"
};

// 2. Main Search Function
cityInput.addEventListener('input', async () => {
    const val = cityInput.value;
    suggestionsBox.style.display = "none";
    currentFocus = -1;

    if (val.length < 2) return;

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${val}&count=5&language=en&format=json`;
        const res = await fetch(geoUrl);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            renderSuggestions(data.results);
        }
    } catch (err) { console.log(err); }
});

async function updateWeather() {
    const cityName = cityInput.value;
    if (!cityName) return;

    try {
        // Fetch up to 5 results instead of 1
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found");
            return;
        }

        // Show suggestions if there are multiple, or just pick the first if only one
        if (geoData.results.length > 1) {
            showSuggestions(geoData.results);
        } else {
            fetchFinalWeather(geoData.results[0]);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

function renderSuggestions(results) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "block";

    results.forEach((city, index) => {
        const div = document.createElement('div');
        div.className = "suggestion-item";
        if (index === 0) div.classList.add('active'); // First one brighter by default
        
        const state = city.admin1 ? `${city.admin1}, ` : "";
        div.innerHTML = `${city.name}<span>${state}${city.country}</span>`;
        
        div.addEventListener('click', () => selectCity(city));
        suggestionsBox.appendChild(div);
    });

    // WHEEL LOCK: Stop Lenis/Page scroll when hovering suggestions
    suggestionsBox.onwheel = (e) => {
        e.stopPropagation(); // Prevents scroll event from reaching Lenis
    };
}

cityInput.addEventListener('keydown', (e) => {
    let items = suggestionsBox.getElementsByClassName("suggestion-item");
    
    if (e.keyCode == 40) { // Arrow DOWN
        currentFocus++;
        addActive(items);
    } else if (e.keyCode == 38) { // Arrow UP
        currentFocus--;
        addActive(items);
    } else if (e.keyCode == 13) { // ENTER
        e.preventDefault();
        if (currentFocus > -1) {
            if (items) items[currentFocus].click();
        } else if (items.length > 0) {
            items[0].click(); // Default to first if nothing selected
        }
    }
});

function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (items.length - 1);
    items[currentFocus].classList.add("active");
    // Ensure the highlighted item is visible in the scroll view
    items[currentFocus].scrollIntoView({ block: "nearest" });
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("active");
    }
}

function selectCity(city) {
    cityInput.value = city.name;
    suggestionsBox.style.display = "none";
    fetchFinalWeather(city); // Your existing weather fetcher
}

// Close suggestions if user clicks outside
document.addEventListener('click', (e) => {
    if (e.target !== cityInput) suggestionsBox.style.display = "none";
});

function showSuggestions(results) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "block";

    results.forEach(city => {
        const div = document.createElement('div');
        div.className = "suggestion-item";
        // Format: City Name, State (if exists), Country
        const state = city.admin1 ? `${city.admin1}, ` : "";
        div.innerHTML = `${city.name}<span>${state}${city.country}</span>`;
        
        div.onclick = () => {
            fetchFinalWeather(city);
            suggestionsBox.style.display = "none";
            cityInput.value = city.name;
        };
        suggestionsBox.appendChild(div);
    });
}

async function fetchFinalWeather(cityData) {
    const { latitude, longitude, name, country } = cityData;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const data = await weatherRes.json();
    displayWeather(data.current, name, country);
}

const info_no_data = document.querySelector(".info-no-data")
const main_info = document.querySelector(".main-info")
const details_grid = document.querySelector(".details-grid")

// 1. Generate Ticks on Page Load
function createCompassTicks() {
    const container = document.getElementById('ticks-container');
    if (!container) return;

    for (let i = 0; i < 360; i += 3) { // Create a tick every 3 degrees
        const tick = document.createElement('div');
        tick.className = 'tick';
        
        if (i % 90 === 0) {
            tick.classList.add('major'); // White every 90 deg
        } else if (i % 30 === 0) {
            tick.classList.add('semi'); // Darker white every 30 deg
        }
        
        tick.style.transform = `translateX(-50%) rotate(${i}deg)`;
        container.appendChild(tick);
    }
}

// Call this once during initialization
createCompassTicks();

let isNavigating = false;
let currentFocus = -1;

const searchbox = document.querySelector('.search-box')
const weatherApp = document.querySelector('.weather-app');

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement && window.lenis) {
            // ACTIVATE LOCK: Tell the observer to ignore the weather app
            isNavigating = true;

            window.lenis.scrollTo(targetElement, {
                offset: 0,
                duration: 2.0,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                onComplete: () => {
                    // DEACTIVATE LOCK: After reaching destination, allow snapping again
                    // We use a small timeout to let the scroll physics settle
                    setTimeout(() => { isNavigating = false; }, 200);
                }
            });
        }
    });
});

// The Observer handles the logic for the "automatic" takeover
const snapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // THE FIX: If we are currently navigating via a link, DO NOTHING
        if (isNavigating) return; 

        // TRIGGER POINT: When 50% of the app is visible
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (window.lenis) {
                window.lenis.velocity = 0; 
            }

            weatherApp.classList.add('expanded');
            searchbox.classList.add('expanded');

            if (window.lenis) {
                window.lenis.scrollTo(weatherApp, {
                    offset: 0,
                    duration: 1.4,
                    lock: true,
                    force: true,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    onComplete: () => {
                        window.lenis.start(); 
                    }
                });
            }
        } 
        else if (entry.intersectionRatio < 0.45) {
            weatherApp.classList.remove('expanded');
            searchbox.classList.remove('expanded');
        }
    });
}, { 
    threshold: [0.45, 0.5] 
});

if (weatherApp) snapObserver.observe(weatherApp);

// Performance Fix: Refresh Lenis after the 100vh growth is finished
weatherApp.addEventListener('transitionend', () => {
    if (window.lenis) {
        window.lenis.resize(); 
    }
});

// 2. Updated displayWeather
function displayWeather(current, cityName, country) {
    info_no_data.style.display = "none";
    main_info.style.display = "flex";
    details_grid.style.display = "grid";

    const windDir = current.wind_direction_10m; 

    const needleWrapper = document.getElementById('needle-wrapper');
    needleWrapper.style.transform = `rotate(${windDir}deg)`;

    // Standard fields
    document.getElementById('location').innerText = `${cityName}, ${country}`;
    document.getElementById('temperature').innerText = Math.round(current.temperature_2m);
    document.getElementById('feels-like').innerText = Math.round(current.apparent_temperature);
    document.getElementById('uv-index').innerText = current.uv_index;
    document.getElementById('precip').innerText = `${current.precipitation} mm`;
    document.getElementById('wind-speed').innerText = `${current.wind_speed_10m} km/h`;
    document.getElementById('wind-dir-val').innerText = current.wind_direction_10m;
    // --- COMPASS ROTATION FIX ---
    // The user wants the arrow to point to the degree stated (e.g., 81 deg points to 81 deg)
    
    
    // We remove the +180 offset so the arrow points DIRECTLY to the degree value
    

    const status = weatherCodes[current.weather_code] || "Unknown";
    document.getElementById('condition').innerText = status;

    const videoElement = document.getElementById('weather-bg-video');
    const videoSource = weatherVideos[current.weather_code] || "clouds.mp4";
    
    
    // Only update if the source actually changes to prevent flickering
    if (!videoElement.src.includes(videoSource)) {
        videoElement.src = videoSource;
        videoElement.load();
        videoElement.play();
    }

    // Refresh Lenis for scroll height
    if (window.lenis) {
        setTimeout(() => window.lenis.resize(), 800); // Wait for CSS transition
    }
}

// Listen for clicks or 'Enter' key
searchBtn.addEventListener('click', updateWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') updateWeather();
});

function scrollToContainer() {
  const element = document.getElementById("footerContainer");
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

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