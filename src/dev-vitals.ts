/**
 * Development-only Core Web Vitals reporter. Imported from `main.tsx`
 * inside an `import.meta.env.DEV` guard, so it never ships in the
 * library bundle nor in the production demo build.
 *
 * Logs CLS, FCP, INP, LCP, and TTFB to the console as each metric
 * becomes available.
 */
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

function log(metric: Metric): void {
  console.log(`[web-vitals] ${metric.name} = ${metric.value.toFixed(2)} (${metric.rating})`);
}

onCLS(log);
onFCP(log);
onINP(log);
onLCP(log);
onTTFB(log);
