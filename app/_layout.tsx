import { ThemeProvider, DarkTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme as any}>
      <NativeTabs
        backgroundColor="transparent"
        tintColor="white"
        labelStyle={{ color: 'white' }}
      >
        <NativeTabs.Trigger
          name="index"
          disableAutomaticContentInsets
          contentStyle={{ backgroundColor: '#0e1622' }}
        >
          <NativeTabs.Trigger.Icon sf="cloud.sun.fill" md="partly_cloudy_day" />
          <NativeTabs.Trigger.Label>Weather</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="settings"
          disableAutomaticContentInsets
          contentStyle={{ backgroundColor: '#0e1622' }}
        >
          <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
