import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntersectionObserverService {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  observeElements() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
      this.observer.observe(element);
    });
  }

  disconnect() {
    this.observer.disconnect();
  }
}