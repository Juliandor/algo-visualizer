interface Entry {
  node: number;
  priority: number;
  tie: number;
  seq: number;
}

/**
 * Binary min-heap. Ordered by priority, then tie, then insertion order
 * (deterministic and easy to test).
 */
export class PriorityQueue {
  private heap: Entry[] = [];
  private counter = 0;

  get size(): number {
    return this.heap.length;
  }

  push(node: number, priority: number, tie = 0): void {
    this.heap.push({ node, priority, tie, seq: this.counter++ });
    this.up(this.heap.length - 1);
  }

  pop(): number | undefined {
    const h = this.heap;
    if (h.length === 0) return undefined;
    const top = h[0];
    const last = h.pop()!;
    if (h.length > 0) {
      h[0] = last;
      this.down(0);
    }
    return top.node;
  }

  private less(a: Entry, b: Entry): boolean {
    if (a.priority !== b.priority) return a.priority < b.priority;
    if (a.tie !== b.tie) return a.tie < b.tie;
    return a.seq < b.seq;
  }

  private up(i: number): void {
    const h = this.heap;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(h[i], h[p])) break;
      [h[i], h[p]] = [h[p], h[i]];
      i = p;
    }
  }

  private down(i: number): void {
    const h = this.heap;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < h.length && this.less(h[l], h[m])) m = l;
      if (r < h.length && this.less(h[r], h[m])) m = r;
      if (m === i) return;
      [h[i], h[m]] = [h[m], h[i]];
      i = m;
    }
  }
}
