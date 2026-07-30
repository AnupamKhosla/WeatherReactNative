import { ThemeProvider, DarkTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme as any}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#080c16' }]} />
      <NativeTabs
        backgroundColor="transparent"
        blurEffect="none"
        tintColor="white"
        labelStyle={{ color: 'white' }}
        unstable_nativeProps={{ nativeContainerStyle: { backgroundColor: 'transparent' } } as any}
      >
        <NativeTabs.Trigger
          name="index"
          disableAutomaticContentInsets
          contentStyle={{ backgroundColor: 'transparent' }}
          unstable_nativeProps={{ style: { backgroundColor: '#080c16' } } as any}
        >
          <NativeTabs.Trigger.Icon sf="cloud.sun.fill" md="partly_cloudy_day" />
          <NativeTabs.Trigger.Label>Weather</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="settings"
          disableAutomaticContentInsets
          contentStyle={{ backgroundColor: 'transparent' }}
          unstable_nativeProps={{ style: { backgroundColor: '#080c16' } } as any}
        >
          <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
