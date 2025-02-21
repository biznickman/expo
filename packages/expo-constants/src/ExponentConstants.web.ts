import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import UAParser from 'ua-parser-js';
import uuidv4 from 'uuid/v4';
import { CodedError } from '@unimodules/core';

import { PlatformManifest, WebManifest, NativeConstants } from './Constants.types';

function getExpoPackage() {
  try {
    return require('expo/package.json');
  } catch (error) {
    throw new CodedError(
      'ERR_CONSTANTS',
      'expoVersion & expoRuntimeVersion require the expo package to be installed.'
    );
  }
}

const parser = new UAParser();
const ID_KEY = 'EXPO_CONSTANTS_INSTALLATION_ID';

declare var __DEV__: boolean;
declare var process: { env: any };
declare var navigator: Navigator;
declare var location: Location;
declare var localStorage: Storage;

const _sessionId = uuidv4();

export default {
  get name(): string {
    return 'ExponentConstants';
  },
  get appOwnership(): 'expo' {
    return 'expo';
  },
  get installationId(): string {
    let installationId;
    try {
      installationId = localStorage.getItem(ID_KEY);
      if (installationId == null || typeof installationId !== 'string') {
        installationId = uuidv4();
        localStorage.setItem(ID_KEY, installationId as string);
      }
    } catch (error) {
      installationId = _sessionId;
    } finally {
      return installationId;
    }
  },
  get sessionId(): string {
    return _sessionId;
  },
  get platform(): PlatformManifest {
    return { web: canUseDOM ? UAParser(navigator.userAgent) : undefined };
  },
  get isHeadless(): false {
    return false;
  },
  get isDevice(): true {
    // TODO: Bacon: Possibly want to add information regarding simulators
    return true;
  },
  get isDetached(): false {
    return false;
  },
  get expoVersion(): string {
    return getExpoPackage().version;
  },
  get linkingUri(): string {
    if (canUseDOM) {
      // On native this is `exp://`
      return location.origin + location.pathname;
    } else {
      return '';
    }
  },
  get expoRuntimeVersion(): string {
    return getExpoPackage().version;
  },
  get deviceName(): string | undefined {
    const { browser, engine, os: OS } = parser.getResult();

    return browser.name || engine.name || OS.name || undefined;
  },
  get nativeAppVersion(): null {
    return null;
  },
  get nativeBuildVersion(): null {
    return null;
  },
  get systemFonts(): string[] {
    // TODO: Bacon: Maybe possible.
    return [];
  },
  get statusBarHeight(): number {
    return 0;
  },
  get deviceYearClass(): number | null {
    // TODO: Bacon: The android version isn't very accurate either, maybe we could try and guess this value.
    return null;
  },
  get manifest(): WebManifest {
    // This is defined by @expo/webpack-config.
    // If your site is bundled with a different config then you may not have access to the app.json automatically.
    return process.env.APP_MANIFEST || {};
  },
  get experienceUrl(): string {
    if (canUseDOM) {
      return location.origin + location.pathname;
    } else {
      return '';
    }
  },
  get debugMode(): boolean {
    return __DEV__;
  },
  async getWebViewUserAgentAsync(): Promise<string | null> {
    if (canUseDOM) {
      return navigator.userAgent;
    } else {
      return null;
    }
  },
} as NativeConstants;
