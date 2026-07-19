import { ThemeProvider, DarkTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

export default function RootLayout() {
  const tint =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ dark: 'white', light: 'black' })
      : 'white';

  return (
    <ThemeProvider value={DarkTheme}>
      <NativeTabs tintColor={tint} labelStyle={{ color: tint }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="cloud.sun.fill" md="partly_cloudy_day" />
          <NativeTabs.Trigger.Label>Weather</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
