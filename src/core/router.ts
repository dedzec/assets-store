/**
 * Router
 * Client-side routing system for navigation between pages
 */

import { ListPage, FormPage, SettingsPage } from '../pages';
import type { PageConstructor } from '../types/core.types';

export class Router {
  private container: HTMLElement;
  private currentPage = 'list';
  private pages: Map<string, PageConstructor>;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;

    this.pages = new Map<string, PageConstructor>([
      ['list', ListPage as PageConstructor],
      ['form', FormPage as PageConstructor],
      ['settings', SettingsPage as PageConstructor],
    ]);
  }

  async navigateTo(pageName: string, params?: Record<string, string>): Promise<void> {
    const PageClass = this.pages.get(pageName);
    
    if (!PageClass) {
      console.error(`Page "${pageName}" not found`);
      return;
    }

    this.currentPage = pageName;
    this.updateActiveMenuItem(pageName);
    
    const page = new PageClass(this.container);
    await page.render(params);

    // Trigger page-enter animation
    this.container.classList.remove('page-transition-enter');
    // Force reflow to restart animation
    void this.container.offsetWidth;
    this.container.classList.add('page-transition-enter');
  }

  getCurrentPage(): string {
    return this.currentPage;
  }

  private updateActiveMenuItem(pageName: string) {
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to current menu item
    const activeItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
}
