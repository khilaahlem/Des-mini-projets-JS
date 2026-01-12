/**
 * Classe Carousel
 * Crée un carrousel responsive et accessible
 */
class Carousel {
  constructor(element, options = {}) {
    // Configuration par défaut
    this.element = element;
    this.options = {
      visibleItems: 3,           // Nombre d'éléments visibles
      itemsToScroll: 1,          // Nombre d'éléments à faire défiler
      loop: true,                // Boucler le carrousel
      autoplay: false,           // Lecture automatique
      autoplayDelay: 5000,       // Délai en ms
      ...options
    };

    // État du carrousel
    this.currentPosition = 0;
    this.autoplayTimer = null;

    // Éléments du DOM
    this.items = Array.from(this.element.querySelectorAll('.carousel__item'));
    
    if (this.items.length === 0) {
      console.error('Aucun élément .carousel__item trouvé');
      return;
    }

    // Initialisation
    this.init();
  }

  /**
   * Initialise le carrousel
   */
  init() {
    // Mettre en place le défilement infini
    this.setupInfiniteLoop();
    
    this.createControls();
    this.bindEvents();
    this.updateCarousel();
    
    if (this.options.autoplay) {
      this.startAutoplay();
    }

    // Responsive - adapter les éléments visibles selon la taille de l'écran
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Configure le défilement infini en dupliquant les éléments
   */
  setupInfiniteLoop() {
    if (!this.options.loop) return;

    const container = this.element.querySelector('.carousel__container');
    if (!container) return;

    // Cloner les premiers éléments et les ajouter à la fin
    const clonedEnd = this.items.map(item => item.cloneNode(true));
    clonedEnd.forEach(clone => {
      clone.classList.add('carousel__item--clone');
      container.appendChild(clone);
    });

    // Cloner les derniers éléments et les ajouter au début
    const clonedStart = this.items.slice().reverse().map(item => item.cloneNode(true));
    clonedStart.reverse().forEach((clone, index) => {
      clone.classList.add('carousel__item--clone');
      container.insertBefore(clone, container.children[0]);
    });

    // Mettre à jour la liste des items pour inclure les clones
    this.allItems = Array.from(container.querySelectorAll('.carousel__item'));
    
    // Décaler la position initiale pour commencer aux vrais éléments
    this.currentPosition = this.items.length;
  }

  /**
   * Crée les boutons de contrôle
   */
  createControls() {
    // Créer le conteneur des contrôles
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel__controls';

    // Bouton précédent
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel__button carousel__button--prev';
    prevButton.innerHTML = '❮';
    prevButton.setAttribute('aria-label', 'Slide précédent');
    prevButton.addEventListener('click', () => this.prev());

    // Bouton suivant
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel__button carousel__button--next';
    nextButton.innerHTML = '❯';
    nextButton.setAttribute('aria-label', 'Slide suivant');
    nextButton.addEventListener('click', () => this.next());

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(nextButton);

    this.element.appendChild(controlsContainer);

    this.prevButton = prevButton;
    this.nextButton = nextButton;

    // Créer la pagination
    this.createPagination();
  }

  /**
   * Crée les points de pagination
   */
  createPagination() {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'carousel__pagination';
    
    // Créer un point pour chaque slide
    this.paginationDots = [];
    this.items.forEach((item, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__pagination-dot';
      dot.setAttribute('aria-label', `Aller au slide ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      paginationContainer.appendChild(dot);
      this.paginationDots.push(dot);
    });
    
    this.element.appendChild(paginationContainer);
  }

  /**
   * Lie les événements
   */
  bindEvents() {
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
      if (!this.element.contains(document.activeElement)) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });

    // Support des touches clavier même sans focus
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });
  }

  /**
   * Obtient le nombre d'éléments visibles selon la taille de l'écran
   */
  getVisibleItems() {
    const width = window.innerWidth;
    
    if (width < 768) {
      return 1; // Mobile: 1 slide
    } else if (width < 1024) {
      return 2; // Tablette: 2 slides
    }
    
    return this.options.visibleItems; // Desktop: configuration
  }

  /**
   * Gère le redimensionnement de la fenêtre
   */
  handleResize() {
    // Vérifier si le nombre de slides visibles a changé
    const visibleItems = this.getVisibleItems();
    
    // Si position invalide, la réajuster
    if (this.currentPosition > this.items.length - visibleItems) {
      this.currentPosition = Math.max(0, this.items.length - visibleItems);
    }
    
    this.updateCarousel();
  }

  /**
   * Défile vers l'avant
   */
  next() {
    const visibleItems = this.getVisibleItems();
    
    // Incrémenter la position
    this.currentPosition += this.options.itemsToScroll;
    
    this.updateCarousel();

    // Vérifier si on doit revenir au début avec transition instantanée
    if (this.options.loop) {
      setTimeout(() => {
        if (this.currentPosition >= this.items.length + this.items.length) {
          this.resetLoopPosition();
        }
      }, 400); // Après la transition CSS
    }
  }

  /**
   * Défile vers l'arrière
   */
  prev() {
    const visibleItems = this.getVisibleItems();
    
    // Décrémenter la position
    this.currentPosition -= this.options.itemsToScroll;
    
    this.updateCarousel();

    // Vérifier si on doit revenir à la fin avec transition instantanée
    if (this.options.loop) {
      setTimeout(() => {
        if (this.currentPosition <= 0) {
          this.resetLoopPosition(true);
        }
      }, 400); // Après la transition CSS
    }
  }

  /**
   * Réinitialise la position pour la boucle infinie
   */
  resetLoopPosition(fromEnd = false) {
    const container = this.element.querySelector('.carousel__container');
    if (!container) return;

    // Désactiver temporairement la transition
    container.style.transition = 'none';

    if (fromEnd) {
      // On revient de la fin, sauter aux vrais éléments à la fin
      this.currentPosition = this.items.length * 2 - this.options.itemsToScroll;
    } else {
      // On revient du début, sauter aux vrais éléments au début
      this.currentPosition = this.items.length;
    }

    // Appliquer la transformation
    const visibleItems = this.getVisibleItems();
    const itemWidth = 100 / visibleItems;
    const offset = -this.currentPosition * itemWidth;
    container.style.transform = `translateX(${offset}%)`;

    // Réactiver la transition
    setTimeout(() => {
      container.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 50);
  }

  /**
   * Met à jour l'affichage du carrousel
   */
  updateCarousel() {
    const visibleItems = this.getVisibleItems();
    const itemWidth = 100 / visibleItems;
    
    // Mettre à jour la position du conteneur
    const container = this.element.querySelector('.carousel__container');
    if (container) {
      const offset = -this.currentPosition * itemWidth;
      container.style.transform = `translateX(${offset}%)`;
    }

    // Mettre à jour l'affichage des boutons
    this.updateButtons(visibleItems);

    // Mettre à jour la pagination
    this.updatePagination();

    // Mettre à jour les attributs ARIA
    this.updateAccessibility();
  }

  /**
   * Met à jour l'état des boutons
   */
  updateButtons(visibleItems) {
    // Avec la boucle infinie, les boutons sont toujours activés
    if (this.options.loop) {
      this.prevButton.disabled = false;
      this.nextButton.disabled = false;
    } else {
      const maxPosition = this.items.length - visibleItems;
      this.prevButton.disabled = this.currentPosition === 0;
      this.nextButton.disabled = this.currentPosition >= maxPosition;
    }
  }

  /**
   * Met à jour l'état de la pagination
   */
  updatePagination() {
    if (!this.paginationDots || !this.options.loop) return;
    
    // Calculer la position réelle (sans les clones)
    const realPosition = this.currentPosition % this.items.length;
    
    this.paginationDots.forEach((dot, index) => {
      if (index === realPosition) {
        dot.classList.add('carousel__pagination-dot--active');
        dot.setAttribute('aria-current', 'page');
      } else {
        dot.classList.remove('carousel__pagination-dot--active');
        dot.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Met à jour les attributs ARIA pour l'accessibilité
   */
  updateAccessibility() {
    const visibleItems = this.getVisibleItems();
    
    if (this.options.loop && this.allItems) {
      // Avec la boucle infinie, utiliser allItems
      this.allItems.forEach((item, index) => {
        const isVisible = index >= this.currentPosition && 
                         index < this.currentPosition + visibleItems;
        
        item.setAttribute('aria-hidden', !isVisible);
        item.tabIndex = isVisible ? 0 : -1;
      });
    } else {
      this.items.forEach((item, index) => {
        const isVisible = index >= this.currentPosition && 
                         index < this.currentPosition + visibleItems;
        
        item.setAttribute('aria-hidden', !isVisible);
        item.tabIndex = isVisible ? 0 : -1;
      });
    }
  }

  /**
   * Démarre la lecture automatique
   */
  startAutoplay() {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.options.autoplayDelay);
  }

  /**
   * Arrête la lecture automatique
   */
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  /**
   * Va à une position spécifique
   */
  goToSlide(index) {
    const visibleItems = this.getVisibleItems();
    const maxPosition = Math.max(0, this.items.length - visibleItems);
    
    this.currentPosition = Math.min(index, maxPosition);
    this.updateCarousel();
  }

  /**
   * Détruit le carrousel
   */
  destroy() {
    this.stopAutoplay();
    document.removeEventListener('keydown', this.bindEvents.bind(this));
  }
}
