import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appInView]',
  host: {
    class: 'in-view-target',
  },
})
export class InViewDirective implements OnInit, OnDestroy {
  @Output() visibleChange = new EventEmitter<boolean>();

  private observer?: IntersectionObserver;
  private wasVisible = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false;

        if (isVisible && !this.wasVisible) {
          this.el.nativeElement.classList.add('is-in-view');
          this.visibleChange.emit(true);
        } else if (!isVisible && this.wasVisible) {
          this.el.nativeElement.classList.remove('is-in-view');
          this.visibleChange.emit(false);
        }

        this.wasVisible = isVisible;
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
