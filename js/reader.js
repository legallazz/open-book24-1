// Reading interface controller
class BookReader {
  constructor() {
    this.isReaderActive = false;
    this.readingMode = "page";
    this.currentProgress = 0;
    this.currentPage = 1;
    this.totalPages = 1;
    this.bookId = "";
    this.savedPosition = null;
    this.lastProgressSave = 0;
    this.readingStartTime = 0;
  }

  setupMenuVisibility() {
    this.isMenuVisible = true;
    this.toggleMenuBtn = document.getElementById("toggle-menu-visibility");
    this.showMenuBtn = document.createElement("button");

    // Создаем кнопку для показа меню
    this.showMenuBtn.className = "show-menu-btn";
    this.showMenuBtn.innerHTML = '<i class="fas fa-eye"></i>';
    this.showMenuBtn.title = "Показать меню";
    this.showMenuBtn.style.display = "none";
    document.body.appendChild(this.showMenuBtn);

    // Обработчики событий
    if (this.toggleMenuBtn) {
      this.toggleMenuBtn.addEventListener("click", () =>
        this.toggleMenuVisibility()
      );
    }

    this.showMenuBtn.addEventListener("click", () => this.showMenu());

    // Скрытие меню при прокрутке вниз и показ при прокрутке вверх
    let lastScrollTop = 0;
    window.addEventListener("scroll", () => {
      if (this.readingMode === "scroll" && this.isMenuVisible) {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Прокрутка вниз - скрываем меню
          this.hideMenu();
        } else if (scrollTop < lastScrollTop) {
          // Прокрутка вверх - показываем меню
          this.showMenu();
        }
        lastScrollTop = scrollTop;
      }
    });
  }

  toggleMenuVisibility() {
    if (this.isMenuVisible) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  hideMenu() {
    const readingMenu = document.querySelector(".reading-menu");
    if (readingMenu) {
      readingMenu.classList.add("hidden");
      this.isMenuVisible = false;
      this.updateToggleButton();
      this.showMenuBtn.style.display = "flex";

      // Сохраняем состояние в localStorage
      this.saveMenuState();
    }
  }

  showMenu() {
    const readingMenu = document.querySelector(".reading-menu");
    if (readingMenu) {
      readingMenu.classList.remove("hidden");
      this.isMenuVisible = true;
      this.updateToggleButton();
      this.showMenuBtn.style.display = "none";

      // Сохраняем состояние в localStorage
      this.saveMenuState();

      // Автоматически скрываем через 3 секунды
      this.scheduleAutoHide();
    }
  }

  updateToggleButton() {
    if (this.toggleMenuBtn) {
      const icon = this.toggleMenuBtn.querySelector("i");
      if (icon) {
        if (this.isMenuVisible) {
          icon.className = "fas fa-eye-slash";
          this.toggleMenuBtn.title = "Скрыть меню";
        } else {
          icon.className = "fas fa-eye";
          this.toggleMenuBtn.title = "Показать меню";
        }
      }
    }
  }

  scheduleAutoHide() {
    // Очищаем предыдущий таймер
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }

    // Устанавливаем новый таймер для автоматического скрытия через 3 секунды
    this.autoHideTimer = setTimeout(() => {
      if (this.isMenuVisible && this.readingMode === "scroll") {
        this.hideMenu();
      }
    }, 3000);
  }

  saveMenuState() {
    const menuState = {
      isMenuVisible: this.isMenuVisible,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      `menu-state-${this.bookId}`,
      JSON.stringify(menuState)
    );
  }

  loadMenuState() {
    const stored = localStorage.getItem(`menu-state-${this.bookId}`);
    if (stored) {
      try {
        const state = JSON.parse(stored);
        const stateAge = Date.now() - new Date(state.timestamp).getTime();

        // Загружаем состояние если оно не старше 24 часов
        if (stateAge < 24 * 60 * 60 * 1000) {
          this.isMenuVisible = state.isMenuVisible;

          if (!this.isMenuVisible) {
            this.hideMenu();
          } else {
            this.showMenu();
          }

          return true;
        }
      } catch (error) {
        console.error("Error loading menu state:", error);
      }
    }
    return false;
  }

  init() {
    const bookConfig = window.bookConfig.getCurrentBook();
    this.bookId = bookConfig ? bookConfig.id : "unknown";

    this.bindEvents();
    this.loadReadingProgress();
    this.setupReadingTracking();
    this.initializeReaderState();
    this.checkSavedProgress();
    this.updateStartButton();
    this.setupMenuVisibility(); // Добавляем эту строку
    this.loadMenuState(); // Загружаем сохраненное состояние меню
  }

  // Добавьте новый метод:
  updateStartButton() {
    const startBtn = document.getElementById("start-reading");
    const continueBtn = document.getElementById("continue-reading");
    const progress = this.loadReadingProgress();

    if (progress && progress.progress > 5) {
      if (startBtn) {
        startBtn.textContent = "Продолжить чтение";
        startBtn.innerHTML =
          '<i class="fas fa-book-open"></i> Продолжить чтение';
      }
      if (continueBtn) {
        continueBtn.style.display = "inline-flex";
        continueBtn.textContent = `Продолжить с ${Math.round(
          progress.progress
        )}%`;
      }
    } else {
      if (startBtn) {
        startBtn.textContent = "Начать чтение";
        startBtn.innerHTML = '<i class="fas fa-book-open"></i> Начать чтение';
      }
      if (continueBtn) {
        continueBtn.style.display = "none";
      }
    }
  }

  checkSavedProgress() {
    const progress = this.loadReadingProgress();
    const continueBtn = document.getElementById("continue-reading");
    const startBtn = document.getElementById("start-reading");

    if (progress && progress.progress > 5) {
      if (continueBtn) {
        continueBtn.style.display = "inline-flex";
        continueBtn.textContent = `Продолжить с ${Math.round(
          progress.progress
        )}%`;
      }
    } else {
      if (continueBtn) {
        continueBtn.style.display = "none";
      }
    }
  }

  bindEvents() {
    // Start reading button
    const startReadingBtn = document.getElementById("start-reading");
    const startTextReadingBtn = document.getElementById("start-text-reading");

    if (startReadingBtn) {
      startReadingBtn.addEventListener("click", () => this.startReading());
    }

    if (startTextReadingBtn) {
      startTextReadingBtn.addEventListener("click", () => this.startReading());
    }

    // Continue reading button
    const continueReadingBtn = document.getElementById("continue-reading");
    if (continueReadingBtn) {
      continueReadingBtn.addEventListener("click", () =>
        this.continueReading()
      );
    }

    // Exit reading button
    const exitReadingBtn = document.getElementById("exit-reading");
    if (exitReadingBtn) {
      exitReadingBtn.addEventListener("click", () => this.exitReading());
    }

    // Reading color settings button
    const readingColorBtn = document.getElementById("reading-color-settings");
    if (readingColorBtn) {
      readingColorBtn.addEventListener("click", () => this.openColorSettings());
    }

    // Theme selector
    const themeSelector = document.getElementById("theme-selector");
    if (themeSelector) {
      themeSelector.addEventListener("change", (e) =>
        this.changeTheme(e.target.value)
      );
    }

    // Reading mode is handled by reading-settings.js

    // Page navigation buttons
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");

    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", () => this.previousPage());
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", () => this.nextPage());
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );

    // Scroll tracking for progress
    window.addEventListener("scroll", () => this.updateReadingProgress());

    // Auto-save progress periodically
    setInterval(() => {
      if (this.isReaderActive) {
        this.saveReadingProgress();
      }
    }, 10000); // Save every 10 seconds
  }

  startReading() {
    this.isReaderActive = true;
    this.savedPosition = null; // Start from beginning
    this.currentProgress = 0;
    this.currentPage = 1;
    this.scrollToReading();
    this.showReadingInterface();
    this.saveReadingProgress();

    // Trigger book content loading
    window.dispatchEvent(new CustomEvent("startReading"));
  }

  continueReading() {
    this.isReaderActive = true;
    const progress = this.loadReadingProgress();

    if (progress) {
      this.currentProgress = progress.progress || 0;
      this.currentPage = progress.page || 1;
      this.readingMode = progress.readingMode || "page";
      this.savedPosition = progress.savedPosition;
    }

    this.scrollToReading();
    this.showReadingInterface();
    this.restoreReadingPosition();
  }

  scrollToReading() {
    // Show the full-screen reading modal
    const readingModal = document.getElementById("reading-modal");
    if (readingModal) {
      readingModal.style.display = "block";
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
  }

  exitReading() {
    this.isReaderActive = false;

    // Hide reading modal
    const readingModal = document.getElementById("reading-modal");
    if (readingModal) {
      readingModal.style.display = "none";
      document.body.style.overflow = ""; // Restore background scrolling
    }

    // Hide reading mode controls
    const readingModeControls = document.getElementById(
      "reading-mode-controls"
    );
    const readingControls = document.getElementById("reading-controls");
    if (readingModeControls) {
      readingModeControls.style.display = "none";
    }
    if (readingControls) {
      readingControls.style.display = "none";
    }

    // Save progress before exiting
    this.saveReadingProgress();
  }

  openColorSettings() {
    // Use the reading settings modal
    if (window.readingSettings) {
      window.readingSettings.openSettings();
    }
  }

  changeTheme(theme) {
    // Apply theme using color customizer
    if (window.colorCustomizer) {
      window.colorCustomizer.applyTheme(theme);
    }
  }

  showReadingInterface() {
    const readingModeControls = document.getElementById(
      "reading-mode-controls"
    );
    const readingControls = document.getElementById("reading-controls");

    if (readingModeControls) {
      readingModeControls.style.display = "block";
    }

    this.setReadingMode(this.readingMode);
    this.updateProgress(this.currentProgress);
  }

  setReadingMode(mode) {
    this.readingMode = mode;

    // Delegate to reading settings
    if (window.readingSettings) {
      window.readingSettings.setReadingMode(mode);
    }

    this.saveReadingProgress();
  }

  setupPageMode() {
    const bookContent = document.getElementById("book-content");
    if (!bookContent) return;

    // Calculate total pages based on content height and viewport
    const contentHeight = bookContent.scrollHeight;
    const viewportHeight = window.innerHeight - 200; // Account for headers
    this.totalPages = Math.ceil(contentHeight / viewportHeight);

    this.updatePageInfo();
    this.showCurrentPage();
  }

  setupScrollMode() {
    const bookContent = document.getElementById("book-content");
    if (bookContent) {
      // Remove pagination styling
      bookContent.style.height = "auto";
      bookContent.style.overflow = "visible";
    }
  }

  showCurrentPage() {
    if (this.readingMode !== "page") return;

    const bookContent = document.getElementById("book-content");
    if (!bookContent) return;

    const viewportHeight = window.innerHeight - 200;
    const scrollPosition = (this.currentPage - 1) * viewportHeight;

    bookContent.style.height = `${viewportHeight}px`;
    bookContent.style.overflow = "hidden";
    bookContent.scrollTop = scrollPosition;

    this.updatePageInfo();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.showCurrentPage();
      this.updateReadingProgress();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.showCurrentPage();
      this.updateReadingProgress();
    }
  }

  updatePageInfo() {
    const currentPageEl = document.getElementById("current-page");
    const totalPagesEl = document.getElementById("total-pages");

    if (currentPageEl) {
      currentPageEl.textContent = this.currentPage;
    }

    if (totalPagesEl) {
      totalPagesEl.textContent = this.totalPages;
    }
  }

  handleKeyboardShortcuts(e) {
    if (!this.isReaderActive) return;

    switch (e.key) {
      case "ArrowLeft":
        if (this.readingMode === "page") {
          e.preventDefault();
          this.previousPage();
        }
        break;
      case "ArrowRight":
        if (this.readingMode === "page") {
          e.preventDefault();
          this.nextPage();
        }
        break;
      case "1":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.setReadingMode("page");
        }
        break;
      case "2":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.setReadingMode("scroll");
        }
        break;
    }
  }

  updateReadingProgress() {
    if (!this.isReaderActive) return;

    let progress = 0;

    if (this.readingMode === "page") {
      progress = (this.currentPage / Math.max(1, this.totalPages)) * 100;
    } else {
      // Scroll mode: calculate based on scroll position
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight
        ) - window.innerHeight;

      progress =
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    }

    this.currentProgress = Math.max(progress, this.currentProgress || 0);
    this.updateProgress(this.currentProgress);

    // Save progress periodically
    if (Date.now() - (this.lastProgressSave || 0) > 2000) {
      this.saveReadingProgress();
      this.lastProgressSave = Date.now();
    }
  }

  updateProgress(progress) {
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `Прогресс: ${Math.round(progress)}%`;
    }

    // Update continue button
    this.checkSavedProgress();
  }

  restoreReadingPosition() {
    if (!this.savedPosition) return;

    if (this.readingMode === "page") {
      this.currentPage = this.savedPosition.page || 1;
      this.showCurrentPage();
    } else {
      // Scroll mode: restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: this.savedPosition.scrollTop || 0,
          behavior: "instant",
        });
      }, 100);
    }
  }

  saveReadingProgress() {
    const savedPosition = {
      scrollTop: window.pageYOffset || document.documentElement.scrollTop,
      page: this.currentPage,
    };

    const progressData = {
      progress: this.currentProgress,
      page: this.currentPage,
      readingMode: this.readingMode,
      savedPosition: savedPosition,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      `reading-progress-${this.bookId}`,
      JSON.stringify(progressData)
    );

    // Update continue button text
    const continueBtn = document.getElementById("continue-reading");
    if (continueBtn && this.currentProgress > 5) {
      continueBtn.textContent = `Продолжить с ${Math.round(
        this.currentProgress
      )}%`;
      continueBtn.style.display = "inline-flex";
    }
  }

  loadReadingProgress() {
    const stored = localStorage.getItem(`reading-progress-${this.bookId}`);
    if (stored) {
      try {
        const progressData = JSON.parse(stored);

        // Only restore if not too old (30 days)
        const dataAge = Date.now() - new Date(progressData.timestamp).getTime();
        if (dataAge < 30 * 24 * 60 * 60 * 1000) {
          return progressData;
        }
      } catch (e) {
        console.error("Error loading reading progress:", e);
      }
    }
    return null;
  }

  setupReadingTracking() {
    // Track time spent reading
    this.readingStartTime = Date.now();

    // Save reading session on page unload
    window.addEventListener("beforeunload", () => {
      this.saveReadingSession();
    });
  }

  saveReadingSession() {
    if (!this.isReaderActive) return;

    const sessionData = {
      bookId: this.bookId,
      startTime: this.readingStartTime,
      endTime: Date.now(),
      progress: this.currentProgress,
      readingMode: this.readingMode,
    };

    // Save to session storage for analytics
    const sessions = JSON.parse(
      sessionStorage.getItem("reading-sessions") || "[]"
    );
    sessions.push(sessionData);

    // Keep only last 10 sessions
    if (sessions.length > 10) {
      sessions.splice(0, sessions.length - 10);
    }

    sessionStorage.setItem("reading-sessions", JSON.stringify(sessions));
  }

  initializeReaderState() {
    // Set up initial reading mode
    this.setReadingMode(this.readingMode);

    // Add reading mode styles
    const style = document.createElement("style");
    style.textContent = `
      .book-content.page-mode {
        overflow: hidden;
        position: relative;
      }
      
      .book-content.scroll-mode {
        overflow: visible;
        height: auto !important;
      }
      
      .reading-controls {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--background-primary);
        border-radius: var(--radius-xl);
        padding: 1rem;
        box-shadow: var(--shadow-xl);
        border: 1px solid var(--border-color);
        z-index: 200;
      }
      
      .control-buttons {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .control-btn {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 50%;
        background-color: var(--primary-color);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .control-btn:hover {
        background-color: var(--primary-hover);
        transform: scale(1.05);
      }
      
      .control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .control-btn svg {
        width: 1rem;
        height: 1rem;
      }
      
      .page-info {
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-weight: 500;
        min-width: 4rem;
        text-align: center;
      }
      
      .reading-mode-controls {
        background: var(--background-secondary);
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 0;
      }
      
      .mode-selector h4 {
        margin-bottom: 1rem;
        color: var(--text-primary);
      }
      
      .mode-buttons {
        display: flex;
        gap: 1rem;
      }
      
      .mode-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: 2px solid var(--border-color);
        background: var(--background-primary);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        color: var(--text-secondary);
      }
      
      .mode-btn:hover {
        border-color: var(--primary-color);
        color: var(--text-primary);
      }
      
      .mode-btn.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }
      
      .mode-btn svg {
        width: 1.25rem;
        height: 1.25rem;
      }
    `;

    document.head.appendChild(style);
  }

  // Public API methods
  getCurrentProgress() {
    return this.currentProgress;
  }

  getReadingMode() {
    return this.readingMode;
  }

  isActive() {
    return this.isReaderActive;
  }
}

// Initialize reader when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.bookReader = new BookReader();
  window.bookReader.init();
});
