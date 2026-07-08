import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('appCountUp') target = 0;
  @Input() countUpSuffix = '';
  @Input() countUpPrefix = '';
  @Input() countUpDuration = 1500;
  @Input() countUpDecimals = 0;

  private observer?: IntersectionObserver;
  private animated = false;
  private frameId = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.el.nativeElement.textContent = `${this.countUpPrefix}0${this.countUpSuffix}`;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !this.animated) {
          this.animated = true;
          this.animate();
        }
      },
      { threshold: 0.4 },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frameId);
  }

  private animate(): void {
    const start = performance.now();
    const from = 0;
    const to = this.target;

    const step = (now: number) => {
      const progress = Math.min((now - start) / this.countUpDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;
      const formatted =
        this.countUpDecimals > 0 ? value.toFixed(this.countUpDecimals) : Math.round(value).toLocaleString();

      this.el.nativeElement.textContent = `${this.countUpPrefix}${formatted}${this.countUpSuffix}`;

      if (progress < 1) {
        this.frameId = requestAnimationFrame(step);
      }
    };

    this.frameId = requestAnimationFrame(step);
  }
}
