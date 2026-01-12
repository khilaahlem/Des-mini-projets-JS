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
    const maxPosition = this.items.length - visibleItems;

    if (this.currentPosition + this.options.itemsToScroll < this.items.length) {
      this.currentPosition += this.options.itemsToScroll;
    } else if (this.options.loop && maxPosition >= 0) {
      this.currentPosition = 0;
    }

    // S'assurer de ne pas dépasser
    if (this.currentPosition > maxPosition) {
      this.currentPosition = this.options.loop ? 0 : maxPosition;
    }

    this.updateCarousel();
  }

  /**
   * Défile vers l'arrière
   */
  prev() {
    if (this.currentPosition - this.options.itemsToScroll >= 0) {
      this.currentPosition -= this.options.itemsToScroll;
    } else if (this.options.loop) {
      const visibleItems = this.getVisibleItems();
      this.currentPosition = Math.max(0, this.items.length - visibleItems);
    } else {
      this.currentPosition = 0;
    }

    this.updateCarousel();
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

    // Mettre à jour les attributs ARIA
    this.updateAccessibility();
  }

  /**
   * Met à jour l'état des boutons
   */
  updateButtons(visibleItems) {
    const maxPosition = this.items.length - visibleItems;

    // Bouton précédent
    if (this.options.loop) {
      this.prevButton.disabled = false;
    } else {
      this.prevButton.disabled = this.currentPosition === 0;
    }

    // Bouton suivant
    if (this.options.loop) {
      this.nextButton.disabled = false;
    } else {
      this.nextButton.disabled = this.currentPosition >= maxPosition;
    }
  }

  /**
   * Met à jour les attributs ARIA pour l'accessibilité
   */
  updateAccessibility() {
    const visibleItems = this.getVisibleItems();
    this.items.forEach((item, index) => {
      const isVisible = index >= this.currentPosition && 
                       index < this.currentPosition + visibleItems;
      
      item.setAttribute('aria-hidden', !isVisible);
      item.tabIndex = isVisible ? 0 : -1;
    });
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
