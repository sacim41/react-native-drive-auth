// src/DriveAuthManager.ts

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {authorize, AuthConfiguration} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum DriveProvider {
  GOOGLE = 'google',
  ONEDRIVE = 'onedrive',
  DROPBOX = 'dropbox',
}

const CONFIG = {
  google: {clientId: '', scopes: []},
  dropbox: {} as AuthConfiguration,
  onedrive: {} as AuthConfiguration,
};

export const configureDriveAuth = (provider: DriveProvider, config: any) => {
  if (provider === DriveProvider.GOOGLE) {
    GoogleSignin.configure(config);
    CONFIG.google = config;
  } else if (provider === DriveProvider.DROPBOX) {
    CONFIG.dropbox = config;
  } else if (provider === DriveProvider.ONEDRIVE) {
    CONFIG.onedrive = config;
  }
};

export async function signIn(provider: DriveProvider): Promise<string> {
  switch (provider) {
    case DriveProvider.GOOGLE:
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      await storeAuthToken(provider, tokens.accessToken);
      return tokens.accessToken;

    case DriveProvider.DROPBOX:
    case DriveProvider.ONEDRIVE:
      const config =
        provider === DriveProvider.DROPBOX
          ? CONFIG.dropbox
          : CONFIG.onedrive;
      const result = await authorize(config);
      await storeAuthToken(provider, result.accessToken);
      return result.accessToken;

    default:
      throw new Error('Unsupported provider');
  }
}

const AUTH_TOKENS_KEY = 'drive_auth_tokens';

export async function storeAuthToken(provider: DriveProvider, token: string) {
  const tokensJson = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
  const tokens = tokensJson ? JSON.parse(tokensJson) : {};
  tokens[provider] = token;
  await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
}

export async function getAuthToken(provider: DriveProvider) {
  const tokensJson = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
  const tokens = tokensJson ? JSON.parse(tokensJson) : {};
  return tokens[provider];
}
