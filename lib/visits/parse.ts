export interface UaInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: 'desktop' | 'tablet' | 'mobile';
  bot: boolean;
}

const first = (ua: string, re: RegExp) => ua.match(re)?.[1] ?? '';

export function parseUa(raw: string | null | undefined, touchPoints = 0): UaInfo {
  const ua = (raw ?? '').slice(0, 512);
  const bot = /bot|crawler|spider|crawling|headless|lighthouse|preview|facebookexternalhit|slurp/i.test(ua);

  let browser = 'Beste bat';
  let browserVersion = '';
  if (/Edg(e|A|iOS)?\//.test(ua)) [browser, browserVersion] = ['Edge', first(ua, /Edg(?:e|A|iOS)?\/([\d.]+)/)];
  else if (/OPR\/|Opera/.test(ua)) [browser, browserVersion] = ['Opera', first(ua, /(?:OPR|Opera)\/([\d.]+)/)];
  else if (/SamsungBrowser\//.test(ua)) [browser, browserVersion] = ['Samsung Internet', first(ua, /SamsungBrowser\/([\d.]+)/)];
  else if (/Firefox\/|FxiOS\//.test(ua)) [browser, browserVersion] = ['Firefox', first(ua, /(?:Firefox|FxiOS)\/([\d.]+)/)];
  else if (/CriOS\//.test(ua)) [browser, browserVersion] = ['Chrome', first(ua, /CriOS\/([\d.]+)/)];
  else if (/Chrome\//.test(ua)) [browser, browserVersion] = ['Chrome', first(ua, /Chrome\/([\d.]+)/)];
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) [browser, browserVersion] = ['Safari', first(ua, /Version\/([\d.]+)/)];
  browserVersion = browserVersion.split('.')[0] ?? '';

  let os = 'Beste bat';
  let osVersion = '';
  if (/Windows NT/.test(ua)) [os, osVersion] = ['Windows', first(ua, /Windows NT ([\d.]+)/)];
  else if (/iPhone|iPod/.test(ua)) [os, osVersion] = ['iOS', first(ua, /OS ([\d_]+)/).replace(/_/g, '.')];
  else if (/iPad/.test(ua)) [os, osVersion] = ['iPadOS', first(ua, /OS ([\d_]+)/).replace(/_/g, '.')];
  else if (/Android/.test(ua)) [os, osVersion] = ['Android', first(ua, /Android ([\d.]+)/)];
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Mac OS X|Macintosh/.test(ua)) [os, osVersion] = ['macOS', first(ua, /Mac OS X ([\d_]+)/).replace(/_/g, '.')];
  else if (/Linux/.test(ua)) os = 'Linux';

  // iPads ask for the desktop site and say "Macintosh": a Mac with a touch screen is an iPad.
  if (os === 'macOS' && touchPoints > 1) os = 'iPadOS';
  const device: UaInfo['device'] =
    os === 'iPadOS' || /Tablet|iPad/.test(ua) || (os === 'Android' && !/Mobile/.test(ua)) ? 'tablet' : /Mobi|iPhone|iPod|Android/.test(ua) ? 'mobile' : 'desktop';

  return { browser, browserVersion, os, osVersion, device, bot };
}
