interface PageMetrics {
  pageName: string;
  loadTime: number;
  renderTime: number;
  timestamp: number;
}

interface ApiMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  cached: boolean;
}

interface UserAction {
  action: string;
  details: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private pageMetrics: PageMetrics[] = [];
  private apiMetrics: ApiMetrics[] = [];
  private userActions: UserAction[] = [];
  private maxStoredItems = 100;

  recordPageLoad(pageName: string, loadTime: number, renderTime: number) {
    const metric: PageMetrics = {
      pageName,
      loadTime,
      renderTime,
      timestamp: Date.now(),
    };
    this.pageMetrics.push(metric);
    if (this.pageMetrics.length > this.maxStoredItems) {
      this.pageMetrics.shift();
    }
    console.log(`📊 Page Load: ${pageName} - Load: ${loadTime}ms, Render: ${renderTime}ms`);
  }

  recordApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    cached: boolean = false
  ) {
    const metric: ApiMetrics = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
      cached,
    };
    this.apiMetrics.push(metric);
    if (this.apiMetrics.length > this.maxStoredItems) {
      this.apiMetrics.shift();
    }
    const cacheLabel = cached ? '(cached)' : '';
    console.log(`📡 API: ${method} ${endpoint} - ${duration}ms ${cacheLabel}`);
  }

  recordUserAction(action: string, details: Record<string, any> = {}) {
    const userAction: UserAction = {
      action,
      details,
      timestamp: Date.now(),
    };
    this.userActions.push(userAction);
    if (this.userActions.length > this.maxStoredItems) {
      this.userActions.shift();
    }
  }

  getPageMetrics() {
    return this.pageMetrics;
  }

  getApiMetrics() {
    return this.apiMetrics;
  }

  getUserActions() {
    return this.userActions;
  }

  getAveragePageLoadTime(): number {
    if (this.pageMetrics.length === 0) return 0;
    const total = this.pageMetrics.reduce((sum, m) => sum + m.loadTime, 0);
    return Math.round(total / this.pageMetrics.length);
  }

  getAverageApiResponseTime(): number {
    if (this.apiMetrics.length === 0) return 0;
    const total = this.apiMetrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(total / this.apiMetrics.length);
  }

  getCacheHitRate(): number {
    if (this.apiMetrics.length === 0) return 0;
    const cached = this.apiMetrics.filter((m) => m.cached).length;
    return Math.round((cached / this.apiMetrics.length) * 100);
  }

  getPerformanceSummary() {
    return {
      avgPageLoadTime: this.getAveragePageLoadTime(),
      avgApiResponseTime: this.getAverageApiResponseTime(),
      cacheHitRate: this.getCacheHitRate(),
      totalApiCalls: this.apiMetrics.length,
      totalPageLoads: this.pageMetrics.length,
      totalUserActions: this.userActions.length,
    };
  }

  clearMetrics() {
    this.pageMetrics = [];
    this.apiMetrics = [];
    this.userActions = [];
  }
}

export const analytics = new Analytics();
