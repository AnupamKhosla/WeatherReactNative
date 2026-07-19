// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Required by expo-router's Metro transform on incremental rebuilds; do not remove.
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(__dirname, 'app');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
