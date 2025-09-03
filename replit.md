# Цифровая Библиотека

## Overview

This is a digital library web application built in Russian that provides an online reading and listening platform for books. The application features a responsive design with both reading and audio playback capabilities, customizable themes, and reading settings to enhance user experience. Users can browse books, read them online with various customization options, or listen to audiobook versions with chapter navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application follows a component-based JavaScript architecture with separate modules for different functionalities:

- **Module-based JavaScript**: Each feature is organized into separate JavaScript files (audio-player.js, book-reader.js, theme.js, etc.) that work together through a centralized configuration system
- **Event-driven architecture**: Uses custom events and event listeners for inter-component communication
- **CSS-in-JS theming**: Dynamic theme switching using CSS custom properties and JavaScript theme management
- **Progressive enhancement**: Base HTML structure with JavaScript enhancements for interactive features

### Reading Experience System

The core reading functionality is built around several key components:

- **BookReader class**: Manages reading state, progress tracking, and page navigation
- **ReadingSettings class**: Handles font customization, theme selection, and reading preferences
- **ColorCustomizer class**: Provides advanced color scheme customization beyond basic themes
- **BookLoader class**: Dynamically loads book content in multiple formats (FB2, PDF support planned)

### Audio Playback Architecture

Audio functionality is handled through a dedicated audio system:

- **AudioPlayer class**: Manages playbook playback with chapter navigation and progress tracking
- **AudioFileManager class**: Handles different audio file naming conventions and provides consistent chapter naming
- **State persistence**: Saves listening progress and allows users to continue from where they left off

### Configuration Management

The application uses a centralized configuration system:

- **BookConfig class**: Stores all book metadata, file paths, and feature availability
- **Local storage integration**: Persists user preferences, reading progress, and customization settings
- **Dynamic content loading**: Book pages are generated from templates with content loaded dynamically

### Theme and Customization System

Visual customization is handled through a multi-layered theming approach:

- **CSS custom properties**: All visual elements use CSS variables for easy theme switching
- **Multiple theme options**: Light, dark, sepia, and blue themes with custom color schemes
- **Reading-specific themes**: Additional themes optimized for reading (dark-warm, dark-blue, etc.)
- **Font and layout customization**: User-configurable fonts, sizes, and text alignment

### Search and Navigation

The application includes client-side search functionality:

- **Real-time search**: Filters books by title, author, and description with debounced input
- **Keyboard navigation**: Support for Escape key to clear search
- **Responsive grid layout**: Books are displayed in a responsive card grid that adapts to search results

## External Dependencies

### Frontend Libraries

- **Font Awesome 6.4.0**: Icon library for UI elements and navigation
- **Google Fonts (Inter)**: Primary typography with additional font options for reading
- **CSS Grid and Flexbox**: Native CSS layout systems for responsive design

### Audio Support

- **HTML5 Audio API**: Native browser audio playback capabilities
- **Multiple audio formats**: Support for MP3, M4A, AAC, OGG, and WAV files
- **Web Audio API**: Planned for advanced audio features

### File Format Support

- **FB2 format**: Primary ebook format with XML parsing
- **PDF support**: Planned integration for PDF book files
- **Audio chapters**: Multi-file audio book support with automatic chapter detection

### Browser APIs

- **Local Storage**: User preferences and reading progress persistence
- **File API**: Book content loading and file format detection
- **Intersection Observer**: Planned for reading progress tracking
- **Web Speech API**: Potential future text-to-speech integration

### Performance Optimizations

- **Lazy loading**: Book content loaded on demand
- **Debounced search**: Optimized search performance with timeout-based filtering
- **CSS transitions**: Smooth animations without external animation libraries
- **Caching strategies**: Duration caching for audio files and progress state management