/**
 * Axion & Meloxi Premium Web Experience
 * Interactive UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Counter Animation ---
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Animation speed (lower is faster)

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const targetText = counter.innerText;
                const isK = targetText.includes('k');
                const isPlus = targetText.includes('+');

                // Clean the number for calculation
                let target = parseFloat(targetText.replace(/[^0-9.]/g, ''));
                if (isK) target *= 1000;

                const count = +counter.getAttribute('data-count') || 0;
                const inc = target / speed;

                if (count < target) {
                    const nextCount = Math.ceil(count + inc);
                    counter.setAttribute('data-count', nextCount);

                    // Format back for display
                    if (isK && nextCount >= 1000) {
                        counter.innerText = (nextCount / 1000).toFixed(0) + 'k' + (isPlus ? '+' : '');
                    } else {
                        counter.innerText = nextCount + (isPlus ? '+' : '');
                    }
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = targetText; // Ensure final text is exact
                }
            };
            updateCount();
        });
    };

    // --- 2. Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    // --- 3. Back to Top ---
    const backToTop = document.getElementById('back-to-top');
    const handleScroll = () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
        revealOnScroll();
    };

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- 4. Scroll Spy for Nav Links ---
    const sections = document.querySelectorAll('section[id], header[id]');
    // Note: since header might not have id, we'll check sections. Wait, 'stats' and 'bots' have ids.
    // The links are: ./ (home), #bots, #stats. Home doesn't have an id, it's just top of page.
    const navLinks = document.querySelectorAll('.nav-link');

    const scrollSpy = () => {
        let current = '';
        const scrollY = window.scrollY;

        // If at the very top, set the home link active
        if (scrollY < 200) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === './' || link.getAttribute('href') === '#') {
                    link.classList.add('active');
                }
            });
            return;
        }

        const sectionsWithIds = document.querySelectorAll('section[id], div[id="stats"]');

        sectionsWithIds.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        }
    };

    // --- 4. Mobile Menu Toggle ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navToggle.classList.toggle('open');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                    navToggle.classList.remove('open');
                }
            });
        });
    }

    // --- Initialize ---
    window.addEventListener('scroll', () => {
        handleScroll();
        scrollSpy();
    });

    // --- 5. Real-Time Data Fetching ---
    const fetchRealTimeStats = async () => {
        /*
         * Read API URL and up to two tokens from meta tags. Fetch each separately
         * and sum the results so both bots’ counts appear combined.
         */
        const metaUrl = document.querySelector('meta[name="api-url"]');
        const metaTokenAxion = document.querySelector('meta[name="api-token-axion"]');
        const metaTokenMeloxi = document.querySelector('meta[name="api-token-meloxi"]');
        const apiUrl = metaUrl ? metaUrl.content : '';
        const apiTokenAxion = metaTokenAxion ? metaTokenAxion.content : '';
        const apiTokenMeloxi = metaTokenMeloxi ? metaTokenMeloxi.content : '';

        const fetchWithToken = async (url, token) => {
            if (!url || !token) return { servers: 0, users: 0, shards: 0 };
            try {
                const res = await fetch(url, {
                    headers: {
                        'Authorization': token.startsWith('Bot ') ? token : `Bot ${token}`,
                        'Accept': 'application/json',
                    },
                });
                return res.ok ? await res.json() : { servers: 0, users: 0, shards: 0 };
            } catch {
                return { servers: 0, users: 0, shards: 0 };
            }
        };

        let total = { servers: 0, users: 0, shards: 0 };
        if (apiTokenAxion) {
            const d = await fetchWithToken(apiUrl, apiTokenAxion);
            total.servers += d.servers || 0;
            total.users += d.users || 0;
            total.shards += d.shards || 0;
        }
        if (apiTokenMeloxi) {
            const d = await fetchWithToken(apiUrl, apiTokenMeloxi);
            total.servers += d.servers || 0;
            total.users += d.users || 0;
            total.shards += d.shards || 0;
        }

        // update DOM values
        if (total.servers) document.getElementById('server-count').innerText = total.servers + '+';
        if (total.users) {
            const formatted = total.users >= 1000 ? (total.users / 1000).toFixed(0) + 'k+' : total.users + '+';
            document.getElementById('user-count').innerText = formatted;
        }
        if (total.shards) document.getElementById('shard-count').innerText = total.shards;

        // always run animation after stats
        setTimeout(animateCounters, 500);
    };

    // Initial calls
    handleScroll();

    // Stats fetch karein aur phir animate karein
    fetchRealTimeStats();
});
