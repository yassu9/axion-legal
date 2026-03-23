/**
 * Axion & Meloxi Premium Web Experience
 * Interactive UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 2. Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the community section, animate the member count
                if (entry.target.classList.contains('community')) {
                    const membersCount = document.getElementById('members-count');
                    if (membersCount && !membersCount.dataset.animated) {
                        const target = parseInt(membersCount.innerText) || 1200;
                        animateValue(membersCount, 0, target, 2000);
                        membersCount.dataset.animated = "true";
                    }
                }
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

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

        const sectionsWithIds = document.querySelectorAll('section[id]');

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

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('open');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Initialize ---
    window.addEventListener('scroll', () => {
        handleScroll();
        scrollSpy();
    });

    // --- 5. Botliy Live Vote Count ---
    const bots = [
        { id: '1455885544285405186', el: 'axion-vote-count', fallback: '54+' },
        { id: '1458423301197140010', el: 'meloxi-vote-count', fallback: '10+' }
    ];

    const fetchVoteCount = async (botId, elementId, fallbackValue) => {
        const voteCountEl = document.getElementById(elementId);
        if (!voteCountEl) return;

        try {
            // Using CORSProxy.io for more reliable cross-origin access
            const apiUrl = `https://botliy.online/api/bots/${botId}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
            
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Proxy unreachable');
            
            const data = await response.json();
            
            if (data && data.votes !== undefined) {
                // Animate count if it's a new value
                animateValue(voteCountEl, parseInt(voteCountEl.innerText) || 0, data.votes, 1000);
            }
        } catch (error) {
            console.error(`Failed to fetch vote count for ${botId}:`, error);
            if (voteCountEl.innerText === '--') {
                voteCountEl.innerText = fallbackValue;
            }
        }
    };

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- 6. Discord Live Member Count via Invite API (no proxy needed) ---
    const INVITE_CODE = 'bhtwdf8sNA';
    
    const fetchDiscordWidget = async () => {
        const membersCountEl = document.getElementById('members-count');
        if (!membersCountEl) return;

        try {
            // Discord Invite API — publicly accessible, no CORS issue
            const apiUrl = `https://discord.com/api/v10/invites/${INVITE_CODE}?with_counts=true`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Discord API unreachable');
            
            const data = await response.json();
            
            // Use total member count
            if (data && data.approximate_member_count !== undefined) {
                const newCount = data.approximate_member_count;
                const currentCount = parseInt(membersCountEl.innerText) || 0;
                
                if (membersCountEl.dataset.animated === 'true') {
                    animateValue(membersCountEl, currentCount, newCount, 1000);
                } else {
                    // Set the value so the scroll animation uses the real number
                    membersCountEl.innerText = newCount;
                }
            }
        } catch (error) {
            console.error('Failed to fetch Discord member data:', error);
        }
    };

    const updateAllVotes = () => {
        bots.forEach(bot => fetchVoteCount(bot.id, bot.el, bot.fallback));
    };

    // Initial fetch and periodic update for all bots
    const updateAllStats = () => {
        updateAllVotes();
        fetchDiscordWidget();
    };

    updateAllStats();
    setInterval(updateAllStats, 60000);

    // Initial calls
    handleScroll();
});
