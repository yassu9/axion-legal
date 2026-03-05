/**
 * Axion & Meloxi Premium Web Experience
 * Interactive UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {

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


    // Initial calls
    handleScroll();


});
