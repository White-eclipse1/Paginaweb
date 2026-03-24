(function () {
  const navbar = document.querySelector('.bakery-navbar');
  const toggler = document.querySelector('.bakery-toggler');
  const collapseEl = document.getElementById('navbarNav');

  const setFooterYear = () => {
    document.querySelectorAll('#year').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  };

  const setupScrollReveal = () => {
    const items = document.querySelectorAll('.scroll-fade');
    if (!items.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    items.forEach((item) => observer.observe(item));
  };

  const setupNavbarVisibility = () => {
    if (!navbar) return;

    let lastY = window.scrollY;
    const topThreshold = 64;

    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= topThreshold) {
        navbar.classList.remove('navbar-hidden');
      } else if (currentY > lastY) {
        navbar.classList.add('navbar-hidden');
      } else {
        navbar.classList.remove('navbar-hidden');
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    if (collapseEl && window.bootstrap && window.bootstrap.Collapse) {
      collapseEl.addEventListener('show.bs.collapse', () => {
        navbar.classList.remove('navbar-hidden');
      });
    }

    if (toggler) {
      toggler.addEventListener('click', () => {
        navbar.classList.remove('navbar-hidden');
      });
    }
  };

  const setupFamilyNavigation = () => {
    const familyLinks = document.querySelectorAll('[data-family-target]');
    const familySections = document.querySelectorAll('[data-family-section]');

    if (!familyLinks.length || !familySections.length || typeof IntersectionObserver === 'undefined') return;

    const setActiveFamily = (id) => {
      familyLinks.forEach((link) => {
        const isActive = link.dataset.familyTarget === id;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      familySections.forEach((section) => {
        section.classList.toggle('is-highlighted', section.id === id);
      });
    };

    const initialHash = window.location.hash ? window.location.hash.slice(1) : familySections[0].id;
    setActiveFamily(initialHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;
        setActiveFamily(visibleEntry.target.id);
      },
      {
        threshold: [0.25, 0.55, 0.8],
        rootMargin: '-18% 0px -45% 0px'
      }
    );

    familySections.forEach((section) => observer.observe(section));

    window.addEventListener('hashchange', () => {
      const id = window.location.hash ? window.location.hash.slice(1) : familySections[0].id;
      setActiveFamily(id);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setFooterYear();
    setupScrollReveal();
    setupNavbarVisibility();
    setupFamilyNavigation();
  });
})();
